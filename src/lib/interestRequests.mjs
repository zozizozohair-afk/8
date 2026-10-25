export const interestOptions = ['شراء وحدة سكنية', 'تسويق عقار', 'إدارة الأملاك', 'استفسار آخر'];
export const interestStatuses = { new: 'جديد', contacted: 'تم التواصل', follow_up: 'متابعة لاحقة', closed: 'مغلق' };
export const interestConsent = 'أوافق على حفظ اسمي ورقم جوالي وبيانات طلبي لدى صفوة عنان، والتواصل معي هاتفيًا أو عبر واتساب بخصوص اهتمامي العقاري.';
export function normalizeSaudiMobile(value = '') {
  let phone = String(value).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[\s()-]/g, '');
  if (/^05\d{8}$/.test(phone)) phone = `+966${phone.slice(1)}`;
  else if (/^9665\d{8}$/.test(phone)) phone = `+${phone}`;
  else if (/^009665\d{8}$/.test(phone)) phone = `+${phone.slice(2)}`;
  return /^\+9665\d{8}$/.test(phone) ? phone : null;
}
export function validateInterest(form) {
  if (form.fullName.trim().length < 2 || form.fullName.trim().length > 100) return 'اكتب اسمًا من حرفين على الأقل.';
  if (!normalizeSaudiMobile(form.phone)) return 'أدخل رقم جوال سعودي صحيحًا، مثل 05XXXXXXXX.';
  if (!interestOptions.includes(form.interest)) return 'اختر نوع اهتمامك.';
  if (form.message.trim().length > 1000) return 'اختصر الملاحظة إلى 1000 حرف أو أقل.';
  if (!form.consent) return 'نحتاج موافقتك على حفظ بياناتك والتواصل معك بشأن طلبك.';
  return '';
}
