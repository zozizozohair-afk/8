export const companyContact = {
  phone: '0570109444', phoneHref: 'tel:+966570109444', unified: '920007936',
  email: 'marketing@safwat-anan.sa', whatsapp: 'https://wa.me/966570109444',
  directions: 'https://maps.app.goo.gl/3KkLHsdk6EKhaMVi8',
  mapEmbed: 'https://maps.google.com/maps?q=24.6407164,46.8435758&hl=ar&z=17&output=embed',
};
export function contactDraft({ name, email, topic, message }) {
  return ['مرحبًا فريق صفوة عنان،', `الاسم: ${name.trim()}`, `أرغب في: ${topic}`, email.trim() ? `البريد الإلكتروني: ${email.trim()}` : '', '', message.trim()].filter((line, index) => line || index === 4).join('\n');
}
