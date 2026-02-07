// Singleton to hold the pipeline
let translator: any = null;

// Configuration for the model
// We use a quantized version of Xenova/nllb-200-distilled-600M or similar multilingual model
// keeping it small for browser usage.
const MODEL_NAME = 'Xenova/nllb-200-distilled-600M';

export interface TranslationResult {
    text: string;
    from: string;
    to: string;
}

/**
 * Initializes the translation model if not already loaded.
 */
async function getTranslator() {
    if (typeof window === 'undefined') return null;

    if (!translator) {
        try {
            console.log('Loading translation model...');
            // Standard dynamic import can fail to destructure if module is undefined/null in Turbopack
            const module = await import('@xenova/transformers');
            if (module && module.pipeline) {
                translator = await module.pipeline('translation', MODEL_NAME);
                console.log('Model loaded.');
            } else {
                console.warn('Pipeline property not found in @xenova/transformers module');
            }
        } catch (error) {
            console.error('Translation model fail (expected in some envs):', error);
            return null;
        }
    }
    return translator;
}

export async function detectLanguage(text: string): Promise<string> {
    const lower = text.toLowerCase().trim();
    if (/[àâéèêëîïôùûç]/.test(lower)) return 'fra_Latn';
    if (/[áéíóúñ¿¡]/.test(lower)) return 'spa_Latn';
    if (/[äöüß]/.test(lower)) return 'deu_Latn';
    if (/[ぁ-んァ-ン]/.test(lower)) return 'jpn_Jpan';
    if (/[\u0D00-\u0D7F]/.test(lower)) return 'mal_Mlym';
    if (/[\u0900-\u097F]/.test(lower)) return 'hin_Deva';
    if (/[\u4e00-\u9fa5]/.test(lower)) return 'zho_Hans';
    if (/[\u0400-\u04FF]/.test(lower)) return 'rus_Cyrl';
    if (/[\u0600-\u06FF]/.test(lower)) return 'ara_Arab';

    return 'eng_Latn';
}

// Hardcoded translations for demo reliability (Fallback)
const DEMO_TRANSLATIONS: Record<string, Record<string, string>> = {
    'mal_Mlym': {
        'Orders': 'ഓർഡറുകൾ',
        'Returns': 'റിട്ടേണുകൾ',
        'Payments': 'പേയ്മെന്റുകൾ',
        'Account': 'അക്കൗണ്ട്',
        'General': 'പൊതുവായവ',
        'Where is my order?': 'എന്റെ ഓർഡർ എവിടെയാണ്?',
        'Can I change my shipping address?': 'എനിക്ക് ഷിപ്പിംഗ് വിലാസം മാറ്റാനാകുമോ?',
        'What is your return policy?': 'നിങ്ങളുടെ റിട്ടേൺ പോളിസി എന്താണ്?',
        'How do I print a return label?': 'ഞാൻ എങ്ങനെ റിട്ടേൺ ലേബൽ പ്രിന്റ് ചെയ്യും?',
        'What payment methods do you accept?': 'ഏതൊക്കെ പേയ്‌മെന്റ് രീതികളാണ് നിങ്ങൾ സ്വീകരിക്കുന്നത്?',
        'I received a wrong item.': 'എനിക്ക് ലഭിച്ചത് തെറ്റായ സാധനമാണ്.',
        'How do I contact support?': 'ഞാൻ എങ്ങനെ സപ്പോർട്ടുമായി ബന്ധപ്പെടും?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "നിങ്ങളുടെ പ്രൊഫൈലിലെ 'എന്റെ ഓർഡറുകൾ' എന്നതിൽ നിങ്ങൾക്ക് ഓർഡർ നില ട്രാക്ക് ചെയ്യാം. ഷിപ്പിംഗിന് സാധാരണയായി 3-5 പ്രവൃത്തി ദിവസങ്ങൾ എടുക്കും.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "'എന്റെ ഓർഡറുകൾ' പേജ് വഴി ഓർഡർ നൽകി 1 മണിക്കൂറിനുള്ളിൽ നിങ്ങൾക്ക് ഷിപ്പിംഗ് വിലാസം അപ്‌ഡേറ്റ് ചെയ്യാം.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "വാങ്ങി 30 ദിവസത്തിനുള്ളിൽ റിട്ടേണുകൾ സ്വിക്കും. സാധനങ്ങൾ ഉപയോഗിക്കാത്തതും ഒറിജിനൽ പാക്കേജിംഗിലും ആയിരിക്കണം.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "ഞങ്ങളുടെ റിട്ടേൺസ് സെന്റർ സന്ദർശിക്കുക, നിങ്ങളുടെ ഓർഡർ ഐഡി നൽകുക, ഞങ്ങൾ നിങ്ങൾക്കായി ഒരു PDF ലേബൽ ജനറേറ്റ് ചെയ്യും.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "ഞങ്ങൾ Visa, MasterCard, Amex, PayPal, Apple Pay എന്നിവ സ്വീകരിക്കുന്നു.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "തെറ്റ് സംഭവിച്ചതിൽ ഞങ്ങൾ ക്ഷമ ചോദിക്കുന്നു. സൗജന്യമായി മാറ്റിസ്ഥാപിക്കുന്നതിനായി സാധനത്തിന്റെ ഫോട്ടോ സഹിതം ഉടൻ തന്നെ സപ്പോർട്ടുമായി ബന്ധപ്പെടുക.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "നിങ്ങൾക്ക് support@example.com ൽ ഞങ്ങളെ ബന്ധപ്പെടാം അല്ലെങ്കിൽ 1-800-555-0199 എന്ന നമ്പറിൽ വിളിക്കാം."
    },
    'ara_Arab': {
        'Orders': 'الطلبات',
        'Returns': 'المرتجعات',
        'Payments': 'المدفوعات',
        'Account': 'الحساب',
        'General': 'عام',
        'Where is my order?': 'أين طلبي؟',
        'Can I change my shipping address?': 'هل يمكنني تغيير عنوان الشحن الخاص بي؟',
        'What is your return policy?': 'ما هي سياسة الإرجاع الخاصة بكم؟',
        'How do I print a return label?': 'كيف يمكنني طباعة ملصق الإرجاع؟',
        'What payment methods do you accept?': 'ما هي طرق الدفع التي تقبلونها؟',
        'I received a wrong item.': 'لقد استلمت منتجًا خاطئًا.',
        'How do I contact support?': 'كيف أتصل بالدعم؟',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "يمكنك تتبع حالة طلبك في ملفك الشخصي تحت 'طلباتي'. يستغرق الشحن عادةً من 3 إلى 5 أيام عمل.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "يمكنك تحديث عنوان الشحن الخاص بك في غضون ساعة واحدة من تقديم الطلب عبر صفحة 'طلباتي'.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "يتم قبول المرتجعات في غضون 30 يومًا من الشراء. يجب أن تكون المنتجات غير مستخدمة وفي تغليفها الأصلي.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "قم بزيارة مركز المرتجعات الخاص بنا ، وأدخل معرّف الطلب الخاص بك ، وسنقوم بإنشاء ملصق PDF قابل للطباعة لك.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "نحن نقبل فيزا وماستركارد وأميكس وباي بال وأبل باي.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "نعتذر عن الخطأ. يرجى الاتصال بالدعم فوراً مع صورة للمنتج لاستبداله مجانًا.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "يمكنك التواصل معنا على support@example.com أو الاتصال بالخط الساخن الدولي على الرقم 0199-555-800-1."
    },
    'fra_Latn': {
        'Orders': 'Commandes',
        'Returns': 'Retours',
        'Payments': 'Paiements',
        'Account': 'Compte',
        'General': 'Général',
        'Where is my order?': 'Où est ma commande ?',
        'Can I change my shipping address?': 'Puis-je changer mon adresse ?',
        'What is your return policy?': 'Quelle est votre politique de retour ?',
        'How do I print a return label?': 'Comment imprimer une étiquette ?',
        'What payment methods do you accept?': 'Quels modes de paiement acceptez-vous ?',
        'I received a wrong item.': 'J\'ai reçu le mauvais article.',
        'How do I contact support?': 'Comment contacter le support ?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "Vous pouvez suivre l'état de votre commande sous 'Mes commandes'. L'expédition prend 3 à 5 jours.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "Vous pouvez modifier votre adresse dans l'heure suivant la commande.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "Les retours sont acceptés sous 30 jours, non utilisés.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "Visitez notre centre de retours pour générer une étiquette PDF.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "Nous acceptons Visa, MasterCard, Amex, PayPal et Apple Pay.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "Désolé pour l'erreur. Contactez le support pour un remplacement gratuit.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "Contactez-nous à support@example.com ou au 1-800-555-0199."
    },
    'spa_Latn': {
        'Orders': 'Pedidos',
        'Returns': 'Devoluciones',
        'Payments': 'Pagos',
        'Account': 'Cuenta',
        'General': 'General',
        'Where is my order?': '¿Dónde está mi pedido?',
        'Can I change my shipping address?': '¿Puedo cambiar mi dirección?',
        'What is your return policy?': '¿Cuál es su política de devoluciones?',
        'How do I print a return label?': '¿Cómo imprimo una etiqueta?',
        'What payment methods do you accept?': '¿Qué métodos de pago aceptan?',
        'I received a wrong item.': 'Recibí un artículo incorrecto.',
        'How do I contact support?': '¿Cómo contacto al soporte?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "Puede rastrear su pedido en 'Mis pedidos'. El envío tarda de 3 a 5 días.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "Puede actualizar su dirección en la primera hora tras el pedido.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "Se aceptan devoluciones en 30 días, sin usar.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "Visite nuestro Centro de Devoluciones para una etiqueta PDF.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "Aceptamos Visa, MasterCard, Amex, PayPal y Apple Pay.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "Disculpe el error. Contacte al soporte para un reemplazo gratis.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "Contáctenos en support@example.com o al 1-800-555-0199."
    },
    'deu_Latn': {
        'Orders': 'Bestellungen',
        'Returns': 'Rücksendungen',
        'Payments': 'Zahlungen',
        'Account': 'Konto',
        'General': 'Allgemein',
        'Where is my order?': 'Wo ist meine Bestellung?',
        'Can I change my shipping address?': 'Kann ich meine Adresse ändern?',
        'What is your return policy?': 'Wie ist Ihre Rückgaberichtlinie?',
        'How do I print a return label?': 'Wie drucke ich ein Etikett?',
        'What payment methods do you accept?': 'Welche Zahlungsmethoden akzeptieren Sie?',
        'I received a wrong item.': 'Falscher Artikel erhalten.',
        'How do I contact support?': 'Wie kontaktiere ich den Support?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "Verfolgen Sie Ihre Bestellung unter 'Meine Bestellungen'. Versand dauert 3-5 Tage.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "Adresse innerhalb einer Stunde nach Bestellung änderbar.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "Rückgabe innerhalb von 30 Tagen möglich.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "Besuchen Sie unser Retourencenter für ein PDF-Etikett.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "Wir akzeptieren Visa, MasterCard, Amex, PayPal und Apple Pay.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "Entschuldigung. Kontaktieren Sie den Support für Ersatz.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "Support unter support@example.com oder 1-800-555-0199."
    },
    'jpn_Jpan': {
        'Orders': '注文',
        'Returns': '返品',
        'Payments': 'お支払い',
        'Account': 'アカウント',
        'General': '一般',
        'Where is my order?': '注文はどこですか？',
        'Can I change my shipping address?': '住所を変更できますか？',
        'What is your return policy?': '返品ポリシーは何ですか？',
        'How do I print a return label?': 'ラベルの印刷方法は？',
        'What payment methods do you accept?': '支払い方法は何がありますか？',
        'I received a wrong item.': '違う商品が届きました。',
        'How do I contact support?': 'サポートへの連絡方法は？',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "「マイページ」で追跡可能です。配送には3〜5日かかります。",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "注文後1時間以内なら住所変更可能です。",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "購入から30日以内の未使用品のみ返品可能です。",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "返品センターでPDFラベルを作成してください。",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "各種カードとPayPal、Apple Payが使えます。",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "手違いをお詫びします。無料交換のお問い合わせをお願いします。",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "連絡先：support@example.com または 1-800-555-0199"
    },
    'hin_Deva': {
        'Orders': 'ऑर्डर',
        'Returns': 'रिटर्न',
        'Payments': 'भुगतान',
        'Account': 'खाता',
        'General': 'सामान्य',
        'Where is my order?': 'मेरा ऑर्डर कहाँ है?',
        'Can I change my shipping address?': 'क्या मैं अपना पता बदल सकता हूँ?',
        'What is your return policy?': 'आपकी रिटर्न पॉलिसी क्या है?',
        'How do I print a return label?': 'मैं रिटर्न लेबल कैसे प्रिंट करूँ?',
        'What payment methods do you accept?': 'आप कौन से भुगतान स्वीकार करते हैं?',
        'I received a wrong item.': 'मुझे गलत सामान मिला है।',
        'How do I contact support?': 'सपोर्ट से कैसे संपर्क करें?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "आप 'मेरे ऑर्डर' में ट्रैक कर सकते हैं। शिपिंग में 3-5 दिन लगते हैं।",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "ऑर्डर के 1 घंटे के भीतर पता बदला जा सकता है।",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "30 दिनों के भीतर रिटर्न स्वीकार किया जाता है।",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "लेबल के लिए हमारे रिटर्न सेंटर पर जाएँ।",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "हम वीजा, पेपाल और एप्पल पे स्वीकार करते हैं।",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "गलती के लिए क्षमा। मुफ्त बदलाव के लिए संपर्क करें।",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "संपर्क: support@example.com या 1-800-555-0199"
    },
    'zho_Hans': {
        'Orders': '订单',
        'Returns': '退货',
        'Payments': '付款',
        'Account': '账户',
        'General': '常规',
        'Where is my order?': '我的订单在哪里？',
        'Can I change my shipping address?': '我可以修改地址吗？',
        'What is your return policy?': '退货政策是什么？',
        'How do I print a return label?': '如何下载退货标签？',
        'What payment methods do you accept?': '支持哪些支付方式？',
        'I received a wrong item.': '我收到了错误的商品。',
        'How do I contact support?': '如何联系客服？',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "在“我的订单”中查看，配送需3-5个工作日。",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "下单后1小时内可修改地址。",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "30天内接受退货，需保持原包装。",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "请访问退货中心下载PDF标签。",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "支持Visa、PayPal、Apple Pay等方式。",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "抱歉发错货，请联系客服免费更换。",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "客服邮箱：support@example.com，电话：1-800-555-0199"
    },
    'rus_Cyrl': {
        'Orders': 'Заказы',
        'Returns': 'Возвраты',
        'Payments': 'Платежи',
        'Account': 'Аккаунт',
        'General': 'Общее',
        'Where is my order?': 'Где мой заказ?',
        'Can I change my shipping address?': 'Можно ли изменить адрес?',
        'What is your return policy?': 'Какова политика возврата?',
        'How do I print a return label?': 'Как распечатать этикетку?',
        'What payment methods do you accept?': 'Какие способы оплаты вы принимаете?',
        'I received a wrong item.': 'Я получил не тот товар.',
        'How do I contact support?': 'Как связаться с поддержкой?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "Следите в 'Моих заказах'. Доставка 3-5 дней.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "Адрес можно сменить в течение часа после заказа.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "Возврат в течение 30 дней, без следов использования.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "Создайте этикетку в Центре возвратов.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "Мы принимаем Visa, PayPal и Apple Pay.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "Извините за ошибку. Свяжитесь для бесплатной замены.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "Email: support@example.com, Тел: 1-800-555-0199"
    },
    'por_Latn': {
        'Orders': 'Pedidos',
        'Returns': 'Devoluções',
        'Payments': 'Pagamentos',
        'Account': 'Conta',
        'General': 'Geral',
        'Where is my order?': 'Onde está meu pedido?',
        'Can I change my shipping address?': 'Posso alterar o endereço?',
        'What is your return policy?': 'Qual a política de devolução?',
        'How do I print a return label?': 'Como imprimir etiqueta?',
        'What payment methods do you accept?': 'Quais formas de pagamento?',
        'I received a wrong item.': 'Recebi o item errado.',
        'How do I contact support?': 'Como falar com o suporte?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "Acompanhe em 'Meus Pedidos'. Entrega em 3-5 dias.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "Endereço editável na 1ª hora após o pedido.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "Devoluções em até 30 dias, sem uso.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "Gere sua etiqueta PDF no Centro de Devoluções.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "Aceitamos Visa, Apple Pay e PayPal.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "Desculpe o erro. Contate-nos para troca grátis.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "Contato: support@example.com ou 1-800-555-0199"
    },
    'ita_Latn': {
        'Orders': 'Ordini',
        'Returns': 'Resi',
        'Payments': 'Pagamenti',
        'Account': 'Account',
        'General': 'Generale',
        'Where is my order?': 'Dov\'è il mio ordine?',
        'Can I change my shipping address?': 'Posso cambiare indirizzo?',
        'What is your return policy?': 'Qual è la politica di reso?',
        'How do I print a return label?': 'Come stampo l\'etichetta?',
        'What payment methods do you accept?': 'Quali pagamenti accettate?',
        'I received a wrong item.': 'Ho ricevuto l\'articolo sbagliato.',
        'How do I contact support?': 'Come contatto l\'assistenza?',
        "You can track your order status in your profile under 'My Orders'. Shipping usually takes 3-5 business days.": "Traccia in 'I miei ordini'. Consegna in 3-5 giorni.",
        "You can update your shipping address within 1 hour of placing the order via the 'My Orders' page.": "Indirizzo modificabile entro un'ora dall'ordine.",
        "Returns are accepted within 30 days of purchase. Items must be unused and in original packaging.": "Resi entro 30 giorni, non usato.",
        "Visit our Returns Center, enter your order ID, and we will generate a printable PDF label for you.": "Scarica l'etichetta PDF nel Centro Resi.",
        "We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.": "Accettiamo Visa, PayPal e Apple Pay.",
        "We apologize for the mistake. Please contact support immediately with a photo of the item for a free replacement.": "Scusate l'errore. Contattateci per il cambio gratuito.",
        "You can reach us at support@example.com or call our international hotline at 1-800-555-0199.": "Email: support@example.com o 1-800-555-0199"
    }
};

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text) return "";
    if (sourceLang === targetLang) return text;

    const normalizedInput = text.trim().toLowerCase();

    // 1. Direct Demo Match (EN -> Native)
    if (sourceLang === 'eng_Latn' && DEMO_TRANSLATIONS[targetLang]) {
        const langPack = DEMO_TRANSLATIONS[targetLang];
        for (const [enKey, nativeValue] of Object.entries(langPack)) {
            if (enKey.toLowerCase() === normalizedInput) return nativeValue;
        }
    }

    // 2. Reverse Demo Match (Native -> EN)
    if (targetLang === 'eng_Latn' && DEMO_TRANSLATIONS[sourceLang]) {
        const langPack = DEMO_TRANSLATIONS[sourceLang];
        for (const [enKey, nativeValue] of Object.entries(langPack)) {
            if (nativeValue.toLowerCase() === normalizedInput) return enKey;
        }
    }

    // 3. Fallback to AI Model
    try {
        const pipe = await getTranslator();
        if (!pipe) return text;

        const output = await pipe(text, {
            src_lang: sourceLang,
            tgt_lang: targetLang,
        });

        return output[0]?.translation_text || text;
    } catch (error) {
        console.error("Translation logic fail (falling back to original):", error);
        return text;
    }
}

// Map common codes to FLORES-200 codes
export const LANGUAGE_MAP: Record<string, string> = {
    'en': 'eng_Latn',
    'fr': 'fra_Latn',
    'es': 'spa_Latn',
    'de': 'deu_Latn',
    'ja': 'jpn_Jpan',
    'ml': 'mal_Mlym',
    'hi': 'hin_Deva',
    'zh': 'zho_Hans',
    'ru': 'rus_Cyrl',
    'ar': 'ara_Arab',
    'pt': 'por_Latn',
    'it': 'ita_Latn',
    'total': 'eng_Latn'
};
