interface Env {
  EMAIL_RELAY_URL?: string;
  EMAIL_RELAY_SECRET?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_RATE_LIMIT?: string;
}

type EmailAddress = {
  email: string;
  name?: string;
};

type EmailMessage = {
  to: string | EmailAddress | (string | EmailAddress)[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
};

const defaultContactToEmail = 'kotrasovapetra@seznam.cz';
const defaultContactFromEmail = 'mirek@thesivak.net';
const maxBodyBytes = 64 * 1024;

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceType: string;
  location: string;
  preferredContact: string;
  website: string;
  turnstileToken: string;
};

const allowedFields = new Set([
  'name',
  'email',
  'phone',
  'message',
  'serviceType',
  'location',
  'preferredContact',
  'website',
  'cf-turnstile-response',
]);

const limits: Record<keyof Omit<FormValues, 'turnstileToken'>, number> = {
  name: 120,
  email: 180,
  phone: 40,
  message: 3000,
  serviceType: 80,
  location: 160,
  preferredContact: 20,
  website: 120,
};

const rateLimitWindowMs = 10 * 60 * 1000;
const defaultRateLimitMax = 5;
const allowedTurnstileHostnames = new Set(['mysticgarden.cz', 'www.mysticgarden.cz']);
const attempts = new Map<string, number[]>();

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const genericError = () => json({ success: false, message: 'Došlo k chybě při odesílání. Zkuste to prosím znovu.' }, 400);

const stripControlCharacters = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, '').trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const clientIp = (request: Request) =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'unknown';

const isRateLimited = (key: string, limit = defaultRateLimitMax) => {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < rateLimitWindowMs);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > limit;
};

const verifyTurnstile = async (token: string, secret: string, ip: string) => {
  if (!token || !secret) return false;

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (ip !== 'unknown') body.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const result: { success?: boolean; hostname?: string } = await response
    .json<{ success?: boolean; hostname?: string }>()
    .catch(() => ({ success: false }));
  return result.success === true && Boolean(result.hostname && allowedTurnstileHostnames.has(result.hostname));
};

const readForm = async (request: Request): Promise<FormValues | null> => {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxBodyBytes) return null;

  const formData = await request.formData();
  for (const [key, value] of formData.entries()) {
    if (!allowedFields.has(key) || typeof value !== 'string') return null;
  }

  const value = (key: keyof Omit<FormValues, 'turnstileToken'>) => {
    const raw = String(formData.get(key) ?? '');
    return stripControlCharacters(raw).slice(0, limits[key]);
  };

  return {
    name: value('name'),
    email: value('email'),
    phone: value('phone'),
    message: value('message'),
    serviceType: value('serviceType'),
    location: value('location'),
    preferredContact: value('preferredContact'),
    website: value('website'),
    turnstileToken: stripControlCharacters(String(formData.get('cf-turnstile-response') ?? '')),
  };
};

const validate = (values: FormValues) => {
  if (values.website) return false;
  if (!values.name || !values.message) return false;
  if (!values.email && !values.phone) return false;
  if (values.email && !isEmail(values.email)) return false;
  if (values.preferredContact && !['email', 'phone'].includes(values.preferredContact)) return false;
  return true;
};

const emailHtml = (values: FormValues) => {
  const rows = [
    ['Jméno', values.name],
    ['Email', values.email],
    ['Telefon', values.phone],
    ['Typ služby', values.serviceType],
    ['Lokalita', values.location],
    ['Preferovaný kontakt', values.preferredContact],
    ['Poptávka', values.message],
  ].filter(([, value]) => value);

  return `
    <h1>Nová poptávka z mysticgarden.cz</h1>
    <table cellpadding="8" cellspacing="0" border="0">
      ${rows
        .map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`)
        .join('')}
    </table>
  `;
};

const sendEmail = async (values: FormValues, env: Env) => {
  if (!env.EMAIL_RELAY_URL || !env.EMAIL_RELAY_SECRET) return false;

  const toEmail = env.CONTACT_TO_EMAIL || defaultContactToEmail;
  const fromEmail = env.CONTACT_FROM_EMAIL || defaultContactFromEmail;

  try {
    const emailSent = await sendViaRelay(env, {
      from: parseEmailAddress(fromEmail),
      to: toEmail,
      replyTo: values.email || undefined,
      subject: `Nová poptávka: ${values.name}`,
      html: emailHtml(values),
      text: [
        `Jméno: ${values.name}`,
        values.email ? `Email: ${values.email}` : '',
        values.phone ? `Telefon: ${values.phone}` : '',
        values.serviceType ? `Typ služby: ${values.serviceType}` : '',
        values.location ? `Lokalita: ${values.location}` : '',
        values.preferredContact ? `Preferovaný kontakt: ${values.preferredContact}` : '',
        '',
        values.message,
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (!emailSent) return false;
  } catch (error) {
    console.error('cloudflare_email_error', error instanceof Error ? error.message : 'unknown');
    return false;
  }

  return true;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = clientIp(request);

  try {
    const rateLimit = Number.parseInt(env.CONTACT_RATE_LIMIT ?? '', 10) || defaultRateLimitMax;
    if (isRateLimited(ip, rateLimit)) return genericError();

    const values = await readForm(request);
    if (!values || !validate(values)) return genericError();

    if (values.turnstileToken) {
      const turnstileOk = await verifyTurnstile(values.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
      if (!turnstileOk) return genericError();
    }

    if (!env.EMAIL_RELAY_URL || !env.EMAIL_RELAY_SECRET) {
      console.error('Missing contact form email environment variables.');
      return genericError();
    }

    const emailSent = await sendEmail(values, env);
    if (!emailSent) return genericError();

    return json({ success: true, message: 'Děkujeme, poptávku jsme přijali.' });
  } catch (error) {
    console.error('Contact form submission failed.', {
      ip,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return genericError();
  }
};

const methodNotAllowed: PagesFunction<Env> = async () =>
  json({ success: false, message: 'Method not allowed.' }, 405);

export const onRequestGet = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestPatch = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;

function parseEmailAddress(value: string): string | EmailAddress {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return value.trim();
  return { name: match[1].replace(/^"|"$/g, '').trim(), email: match[2].trim() };
}

async function sendViaRelay(env: Env, message: EmailMessage): Promise<boolean> {
  const response = await fetch(env.EMAIL_RELAY_URL || '', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.EMAIL_RELAY_SECRET}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  return response.ok;
}
