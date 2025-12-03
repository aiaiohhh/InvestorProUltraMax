export const isDevPreviewMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export const previewEmail =
  process.env.NEXT_PUBLIC_PREVIEW_EMAIL || 'dev@ipum.test';

export const previewPassword =
  process.env.NEXT_PUBLIC_PREVIEW_PASSWORD || 'ascent123';

export const previewName =
  process.env.NEXT_PUBLIC_PREVIEW_NAME || 'Investor Preview User';

export const previewCredentialsLabel = `${previewEmail} / ${previewPassword}`;

