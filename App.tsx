import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { Product, CartItem, Order, OrderItem, ProductPortion, ProductStatus, ProductUnit, ProductPackaging, User, OrderStatus, ProductBadge, CustomerType } from './types';
import CategoryDropdown from './components/CategoryDropdown';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import AdminPage from './components/AdminPanel';
import ImageGalleryModal from './components/ImageGalleryModal';
import { AuthContext } from './contexts/AuthContext';

const INITIAL_CATEGORIES = [
  'Твердые',
  'Мягкие',
  'С плесенью',
  'Козьи и овечьи',
  'Рассольные',
  'Свежие',
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Пармезан', pricePerUnit: 2500, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/282/400/300', 'https://picsum.photos/id/283/400/300', 'https://picsum.photos/id/284/400/300'], unitValue: 5.3, unit: 'kg', packaging: 'головка', description: 'Итальянский твердый сыр долгого созревания. Обладает ломкой текстурой и пикантным вкусом.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 1800, usp1Price: 2600, usp1UseGlobalMarkup: false, priceTiers: {'оптовый': 2200, 'средний опт': 2100, 'крупный опт': 2000} },
  { id: 2, name: 'Гауда', pricePerUnit: 1800, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/431/400/300', 'https://picsum.photos/id/432/400/300', 'https://picsum.photos/id/433/400/300'], unitValue: 2.1, unit: 'kg', packaging: 'головка', description: 'Популярный голландский сыр с мягким сливочным вкусом. Идеален для бутербродов и закусок.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 1200, usp1UseGlobalMarkup: true, priceTiers: {'оптовый': 1600} },
  { id: 3, name: 'Бри', pricePerUnit: 2200, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/435/400/300', 'https://picsum.photos/id/436/400/300', 'https://picsum.photos/id/437/400/300'], unitValue: 1.2, unit: 'kg', packaging: 'головка', description: 'Французский мягкий сыр с корочкой из белой плесени. Имеет нежный грибной аромат.', allowedPortions: ['whole'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 1600, usp1UseGlobalMarkup: true, priceTiers: {'оптовый': 1900} },
  { id: 4, name: 'Камамбер', pricePerUnit: 480, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/312/400/300', 'https://picsum.photos/id/313/400/300', 'https://picsum.photos/id/314/400/300'], unitValue: 1, unit: 'pcs', packaging: 'упаковка', description: 'Знаменитый французский сыр с кремовой текстурой и насыщенным вкусом. Часто запекают целиком.', allowedPortions: ['whole'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 350, usp1UseGlobalMarkup: true, badge: 'ХИТ', priceTiers: {} },
  { id: 5, name: 'Рокфор', pricePerUnit: 3500, categories: ['С плесенью', 'Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/1060/400/300', 'https://picsum.photos/id/1061/400/300'], unitValue: 3.5, unit: 'kg', packaging: 'головка', description: 'Овечий сыр с голубой плесенью из Франции. Отличается острым, соленым вкусом и ярким ароматом.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 2800, usp1UseGlobalMarkup: true, priceTiers: {} },
  { id: 6, name: 'Горгонзола', pricePerUnit: 3200, categories: ['С плесенью'], imageUrls: ['https://picsum.photos/id/1080/400/300', 'https://picsum.photos/id/1081/400/300', 'https://picsum.photos/id/1082/400/300'], unitValue: 1.5, unit: 'kg', packaging: 'головка', description: 'Итальянский голубой сыр. Бывает двух видов: сладкий (dolce) и пикантный (piccante).', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 2500, usp1UseGlobalMarkup: true, priceTiers: {} },
  { id: 7, name: 'Шевр', pricePerUnit: 560, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/203/400/300', 'https://picsum.photos/id/204/400/300'], unitValue: 1, unit: 'pcs', packaging: 'штука', description: 'Французский козий сыр с характерной кислинкой и нежной, творожистой текстурой.', allowedPortions: ['whole'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 400, usp1UseGlobalMarkup: true, priceTiers: {} },
  { id: 8, name: 'Фета', pricePerUnit: 300, categories: ['Козьи и овечьи', 'Рассольные'], imageUrls: ['https://picsum.photos/id/375/400/300', 'https://picsum.photos/id/376/400/300', 'https://picsum.photos/id/377/400/300'], unitValue: 200, unit: 'g', packaging: 'упаковка', description: 'Греческий рассольный сыр из овечьего молока. Незаменимый ингредиент греческого салата.', allowedPortions: ['whole'], status: ProductStatus.Available, priceOverridesPerUnit: {}, costPrice: 200, usp1UseGlobalMarkup: true, priceTiers: {} },
  { id: 9, name: 'Маасдам', pricePerUnit: 1600, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/501/400/300'], unitValue: 12, unit: 'kg', packaging: 'головка', description: 'Голландский сыр с большими глазками и сладковато-ореховым вкусом.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 1100, priceTiers: {} },
  { id: 10, name: 'Эмменталь', pricePerUnit: 2300, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/502/400/300'], unitValue: 80, unit: 'kg', packaging: 'головка', description: 'Швейцарский сыр, известный своими крупными дырками. Имеет пикантный, фруктовый вкус.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 1700, priceTiers: {} },
  { id: 11, name: 'Чеддер', pricePerUnit: 1900, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/503/400/300'], unitValue: 25, unit: 'kg', packaging: 'головка', description: 'Популярный английский сыр. Вкус варьируется от мягкого до очень острого в зависимости от выдержки.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1400, priceTiers: {} },
  { id: 12, name: 'Дорблю', pricePerUnit: 2800, categories: ['С плесенью'], imageUrls: ['https://picsum.photos/id/504/400/300'], unitValue: 2.5, unit: 'kg', packaging: 'головка', description: 'Немецкий голубой сыр с умеренно-острым, пряным вкусом. Более мягкий, чем Рокфор.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2100, priceTiers: {} },
  { id: 13, name: 'Рикотта', pricePerUnit: 800, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/505/400/300'], unitValue: 500, unit: 'g', packaging: 'упаковка', description: 'Итальянский сывороточный сыр с нежной, зернистой текстурой и сладковатым вкусом. Используется в десертах и выпечке.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 550, priceTiers: {} },
  { id: 14, name: 'Моцарелла', pricePerUnit: 250, categories: ['Свежие', 'Рассольные'], imageUrls: ['https://picsum.photos/id/506/400/300'], unitValue: 125, unit: 'g', packaging: 'упаковка', description: 'Итальянский свежий сыр в виде шариков в рассоле. Идеален для пиццы и салата капрезе.', allowedPortions: ['whole'], status: ProductStatus.Available, badge: 'ХИТ', costPrice: 180, priceTiers: {} },
  { id: 15, name: 'Пекорино Романо', pricePerUnit: 3300, categories: ['Твердые', 'Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/507/400/300'], unitValue: 20, unit: 'kg', packaging: 'головка', description: 'Твердый, соленый итальянский сыр из овечьего молока. Часто используется для пасты.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2600, priceTiers: {} },
  { id: 16, name: 'Сулугуни', pricePerUnit: 900, categories: ['Рассольные'], imageUrls: ['https://picsum.photos/id/508/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Грузинский рассольный сыр со слоистой текстурой и солоноватым вкусом. Отлично подходит для хачапури.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 650, priceTiers: {} },
  { id: 17, name: 'Адыгейский', pricePerUnit: 700, categories: ['Свежие', 'Мягкие'], imageUrls: ['https://picsum.photos/id/509/400/300'], unitValue: 400, unit: 'g', packaging: 'упаковка', description: 'Мягкий сыр с нежным кисломолочным вкусом. Популярен в кавказской кухне.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 500, priceTiers: {} },
  { id: 18, name: 'Грюйер', pricePerUnit: 2900, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/510/400/300'], unitValue: 35, unit: 'kg', packaging: 'головка', description: 'Швейцарский твердый сыр со сладковатым ореховым привкусом. Прекрасно плавится, идеален для фондю.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2200, priceTiers: {} },
  { id: 19, name: 'Стилтон', pricePerUnit: 3600, categories: ['С плесенью'], imageUrls: ['https://picsum.photos/id/511/400/300'], unitValue: 8, unit: 'kg', packaging: 'головка', description: 'Английский "король сыров". Имеет сильные прожилки голубой плесени и сложный, насыщенный вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, badge: 'акция', costPrice: 2900, priceTiers: {} },
  { id: 20, name: 'Фетакса', pricePerUnit: 250, categories: ['Рассольные'], imageUrls: ['https://picsum.photos/id/512/400/300'], unitValue: 400, unit: 'g', packaging: 'упаковка', description: 'Аналог феты, но с более нежной и кремовой текстурой. Часто используется в салатах и закусках.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 170, priceTiers: {} },
  { id: 21, name: 'Манчего', pricePerUnit: 3100, categories: ['Твердые', 'Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/513/400/300'], unitValue: 3, unit: 'kg', packaging: 'головка', description: 'Испанский сыр из овечьего молока с характерным узором на корочке. Вкус маслянистый, с легкой кислинкой.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2400, priceTiers: {} },
  { id: 22, name: 'Проволоне', pricePerUnit: 1700, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/514/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Итальянский полутвердый сыр. Бывает сладким (dolce) и острым (piccante). Часто используется для сэндвичей.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1250, priceTiers: {} },
  { id: 23, name: 'Халуми', pricePerUnit: 450, categories: ['Рассольные'], imageUrls: ['https://picsum.photos/id/515/400/300'], unitValue: 250, unit: 'g', packaging: 'упаковка', description: 'Кипрский сыр для жарки. Имеет высокую температуру плавления, что позволяет обжаривать его до золотистой корочки.', allowedPortions: ['whole'], status: ProductStatus.Available, badge: 'ХИТ', costPrice: 320, priceTiers: {} },
  { id: 24, name: 'Буратта', pricePerUnit: 550, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/516/400/300'], unitValue: 250, unit: 'g', packaging: 'штука', description: 'Итальянский свежий сыр, представляющий собой мешочек из моцареллы, наполненный сливками и сырными нитями (страчателла).', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 400, priceTiers: {} },
  { id: 25, name: 'Страчателла', pricePerUnit: 480, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/517/400/300'], unitValue: 200, unit: 'g', packaging: 'упаковка', description: 'Нежные сырные нити в густых сливках. Начинка для буратты, но продается и как самостоятельный продукт.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 350, priceTiers: {} },
  { id: 26, name: 'Качотта', pricePerUnit: 1500, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/518/400/300'], unitValue: 0.5, unit: 'kg', packaging: 'головка', description: 'Итальянский полумягкий столовый сыр. Часто производится с добавками: орехи, перец, оливки.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 1000, priceTiers: {} },
  { id: 27, name: 'Валансе', pricePerUnit: 800, categories: ['Козьи и овечьи', 'С плесенью'], imageUrls: ['https://picsum.photos/id/519/400/300'], unitValue: 220, unit: 'g', packaging: 'штука', description: 'Французский козий сыр в форме усеченной пирамиды, обсыпанный древесной золой. Имеет орехово-цитрусовый вкус.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 600, priceTiers: {} },
  { id: 28, name: 'Кроттен-де-Шавиньоль', pricePerUnit: 400, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/520/400/300'], unitValue: 60, unit: 'g', packaging: 'штука', description: 'Маленький козий сыр из долины Луары. Вкус меняется от нежного до острого по мере созревания.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 280, priceTiers: {} },
  { id: 29, name: 'Тет-де-Муан', pricePerUnit: 4500, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/521/400/300'], unitValue: 0.8, unit: 'kg', packaging: 'головка', description: 'Швейцарский сыр "Голова монаха", который принято нарезать специальным ножом (жиролем), получая тонкие "лисички".', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 3500, priceTiers: {} },
  { id: 30, name: 'Раклет', pricePerUnit: 2400, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/522/400/300'], unitValue: 5, unit: 'kg', packaging: 'головка', description: 'Швейцарский полутвердый сыр, созданный для плавления. Сердце одноименного национального блюда.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1800, priceTiers: {} },
  { id: 31, name: 'Камамбер ди Буфала', pricePerUnit: 700, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/523/400/300'], unitValue: 250, unit: 'g', packaging: 'упаковка', description: 'Итальянский камамбер из молока буйволицы. Более насыщенный и сливочный, чем классический.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 520, priceTiers: {} },
  { id: 32, name: 'Томм', pricePerUnit: 2000, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/524/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Группа французских сыров, обычно с серой несъедобной корочкой. Вкус землистый, грибной.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1500, priceTiers: {} },
  { id: 33, name: 'Конте', pricePerUnit: 2800, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/525/400/300'], unitValue: 40, unit: 'kg', packaging: 'головка', description: 'Французский твердый сыр из региона Юра. Вкус сложный, с нотами коричневого масла и жареных орехов.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2100, priceTiers: {} },
  { id: 34, name: 'Бофор', pricePerUnit: 3200, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/526/400/300'], unitValue: 45, unit: 'kg', packaging: 'головка', description: 'Французский "принц Грюйеров". Гладкий, кремовый, с ароматом цветов и фруктов.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2500, priceTiers: {} },
  { id: 35, name: 'Реблошон', pricePerUnit: 2600, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/527/400/300'], unitValue: 0.5, unit: 'kg', packaging: 'головка', description: 'Мягкий французский сыр с промытой корочкой. Имеет сильный аромат и ореховый вкус. Ключевой ингредиент тартифлета.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 1900, priceTiers: {} },
  { id: 36, name: 'Мюнстер', pricePerUnit: 2500, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/528/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Ароматный мягкий сыр из Эльзаса с оранжевой корочкой. Вкус намного мягче, чем запах.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1850, priceTiers: {} },
  { id: 37, name: 'Ливаро', pricePerUnit: 2700, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/529/400/300'], unitValue: 0.5, unit: 'kg', packaging: 'головка', description: 'Один из самых старых нормандских сыров. Очень пахучий, с интенсивным пряным вкусом.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 2000, priceTiers: {} },
  { id: 38, name: 'Пон-л\'Эвек', pricePerUnit: 2650, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/530/400/300'], unitValue: 0.4, unit: 'kg', packaging: 'штука', description: 'Французский мягкий сыр квадратной формы. Имеет кремовую текстуру и деревенский аромат.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 1950, priceTiers: {} },
  { id: 39, name: 'Эпуасс', pricePerUnit: 900, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/531/400/300'], unitValue: 250, unit: 'g', packaging: 'штука', description: 'Бургундский сыр, который промывают в бренди. Обладает невероятно сильным запахом и текучей мякотью.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 700, priceTiers: {} },
  { id: 40, name: 'Лангр', pricePerUnit: 850, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/532/400/300'], unitValue: 180, unit: 'g', packaging: 'штука', description: 'Мягкий сыр из Шампани с углублением сверху, в которое принято наливать шампанское или марк.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 650, priceTiers: {} },
  { id: 41, name: 'Российский', pricePerUnit: 800, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/533/400/300'], unitValue: 7, unit: 'kg', packaging: 'головка', description: 'Классический полутвердый сыр с мелкими глазками и кисловатым вкусом.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 550, priceTiers: {} },
  { id: 42, name: 'Костромской', pricePerUnit: 750, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/534/400/300'], unitValue: 6, unit: 'kg', packaging: 'головка', description: 'Похож на Гауду, но с более выраженным сливочным вкусом.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 520, priceTiers: {} },
  { id: 43, name: 'Пошехонский', pricePerUnit: 780, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/535/400/300'], unitValue: 5, unit: 'kg', packaging: 'головка', description: 'Сыр с пряным, слегка кисловатым вкусом. Традиционный продукт российской сырной промышленности.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 540, priceTiers: {} },
  { id: 44, name: 'Голландский', pricePerUnit: 820, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/536/400/300'], unitValue: 2.5, unit: 'kg', packaging: 'головка', description: 'Классический брусковый сыр, аналог голландского Эдама. Слегка островатый вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 580, priceTiers: {} },
  { id: 45, name: 'Тильзитер', pricePerUnit: 1200, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/537/400/300'], unitValue: 4, unit: 'kg', packaging: 'головка', description: 'Прусско-швейцарский сыр с пикантным ароматом и эластичной текстурой. Часто содержит тмин.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 850, priceTiers: {} },
  { id: 46, name: 'Кашкавал', pricePerUnit: 1300, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/538/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Балканский и южно-итальянский сыр из группы "паста филата". Солоноватый, слегка овечий вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 950, priceTiers: {} },
  { id: 47, name: 'Маскарпоне', pricePerUnit: 350, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/539/400/300'], unitValue: 250, unit: 'g', packaging: 'банка', description: 'Итальянский сливочный сыр, по консистенции напоминающий крем. Основа для десерта тирамису.', allowedPortions: ['whole'], status: ProductStatus.Available, badge: 'много', costPrice: 250, priceTiers: {} },
  { id: 48, name: 'Филадельфия', pricePerUnit: 280, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/540/400/300'], unitValue: 150, unit: 'g', packaging: 'упаковка', description: 'Американский сливочный сыр (cream cheese). Популярен для чизкейков и роллов.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 200, priceTiers: {} },
  { id: 49, name: 'Кварк', pricePerUnit: 180, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/541/400/300'], unitValue: 200, unit: 'g', packaging: 'банка', description: 'Европейский вид мягкого творога. Нежный, без кислинки, используется для выпечки и десертов.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 120, priceTiers: {} },
  { id: 50, name: 'Фромаж блан', pricePerUnit: 220, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/542/400/300'], unitValue: 200, unit: 'g', packaging: 'банка', description: 'Французский "белый сыр", аналог кварка или нежного творога. Едят с фруктами, медом или травами.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 160, priceTiers: {} },
  { id: 51, name: 'Сент-Мор-де-Турен', pricePerUnit: 950, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/543/400/300'], unitValue: 250, unit: 'g', packaging: 'штука', description: 'Козье полено с соломинкой внутри. Обладает ярким вкусом и покрыто серой золой.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 750, priceTiers: {} },
  { id: 52, name: 'Пикодон', pricePerUnit: 350, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/544/400/300'], unitValue: 60, unit: 'g', packaging: 'штука', description: 'Маленький, плотный козий сыр из региона Рона. Имеет острый, перечный вкус.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 260, priceTiers: {} },
  { id: 53, name: 'Оссо-Ирати', pricePerUnit: 3400, categories: ['Твердые', 'Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/545/400/300'], unitValue: 2, unit: 'kg', packaging: 'головка', description: 'Овечий сыр из страны Басков. Маслянистый, ореховый, с ароматом фундука.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2700, priceTiers: {} },
  { id: 54, name: 'Идиасабаль', pricePerUnit: 3500, categories: ['Твердые', 'Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/546/400/300'], unitValue: 1.2, unit: 'kg', packaging: 'головка', description: 'Копченый овечий сыр из страны Басков. Имеет характерный дымный аромат и пикантный вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2800, priceTiers: {} },
  { id: 55, name: 'Тетя', pricePerUnit: 1800, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/547/400/300'], unitValue: 0.5, unit: 'kg', packaging: 'головка', description: 'Испанский сыр из Галисии в форме женской груди. Мягкий, сливочный вкус.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 1300, priceTiers: {} },
  { id: 56, name: 'Азиаго', pricePerUnit: 2100, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/548/400/300'], unitValue: 10, unit: 'kg', packaging: 'головка', description: 'Итальянский сыр, бывает свежим (Fresco) и выдержанным (Stagionato). Вкус от молочного до орехового.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1600, priceTiers: {} },
  { id: 57, name: 'Фонтина', pricePerUnit: 2600, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/549/400/300'], unitValue: 9, unit: 'kg', packaging: 'головка', description: 'Итальянский альпийский сыр. Землистый, ореховый, идеально плавится.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2000, priceTiers: {} },
  { id: 58, name: 'Таледжио', pricePerUnit: 2300, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/550/400/300'], unitValue: 2, unit: 'kg', packaging: 'штука', description: 'Итальянский мягкий сыр с промытой корочкой. Имеет сильный аромат, но мягкий, фруктовый вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1750, priceTiers: {} },
  { id: 59, name: 'Монтерей Джек', pricePerUnit: 1500, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/551/400/300'], unitValue: 5, unit: 'kg', packaging: 'головка', description: 'Американский полутвердый сыр. Мягкий, маслянистый, хорошо плавится.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1100, priceTiers: {} },
  { id: 60, name: 'Колби', pricePerUnit: 1550, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/552/400/300'], unitValue: 6, unit: 'kg', packaging: 'головка', description: 'Более мягкий и влажный, чем Чеддер. Часто смешивается с Монтерей Джеком (сыр Colby-Jack).', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1150, priceTiers: {} },
  { id: 61, name: 'Лимбургер', pricePerUnit: 1900, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/553/400/300'], unitValue: 0.5, unit: 'kg', packaging: 'штука', description: 'Сыр, знаменитый своим очень сильным запахом, вызванным бактерией Brevibacterium linens.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 1400, priceTiers: {} },
  { id: 62, name: 'Гавро', pricePerUnit: 350, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/554/400/300'], unitValue: 100, unit: 'g', packaging: 'упаковка', description: 'Небольшой свежий козий сыр в виде шайбы, часто с травами или специями.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 250, priceTiers: {} },
  { id: 63, name: 'Брынза', pricePerUnit: 800, categories: ['Рассольные', 'Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/555/400/300'], unitValue: 500, unit: 'g', packaging: 'упаковка', description: 'Рассольный сыр из овечьего молока, популярный в Восточной Европе. Соленый и крошащийся.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 600, priceTiers: {} },
  { id: 64, name: 'Камамбер с трюфелем', pricePerUnit: 900, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/556/400/300'], unitValue: 250, unit: 'g', packaging: 'упаковка', description: 'Классический камамбер с прослойкой из черного трюфеля и маскарпоне. Роскошный деликатес.', allowedPortions: ['whole'], status: ProductStatus.Available, badge: 'мало', costPrice: 700, priceTiers: {} },
  { id: 65, name: 'Бри с травами', pricePerUnit: 450, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/557/400/300'], unitValue: 200, unit: 'g', packaging: 'упаковка', description: 'Нежный бри, покрытый смесью прованских трав для дополнительного аромата.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 320, priceTiers: {} },
  { id: 66, name: 'Чечил', pricePerUnit: 200, categories: ['Рассольные'], imageUrls: ['https://picsum.photos/id/558/400/300'], unitValue: 100, unit: 'g', packaging: 'упаковка', description: 'Волокнистый рассольный сыр в виде косички. Популярная закуска к пиву.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 140, priceTiers: {} },
  { id: 67, name: 'Скаморца', pricePerUnit: 400, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/559/400/300'], unitValue: 200, unit: 'g', packaging: 'штука', description: 'Итальянский сыр в форме груши, бывает свежим или копченым (affumicata).', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 280, priceTiers: {} },
  { id: 68, name: 'Данаблу', pricePerUnit: 2500, categories: ['С плесенью'], imageUrls: ['https://picsum.photos/id/560/400/300'], unitValue: 3, unit: 'kg', packaging: 'головка', description: 'Датский голубой сыр, созданный как аналог Рокфора. Острый, соленый вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1900, priceTiers: {} },
  { id: 69, name: 'Мимолет', pricePerUnit: 2200, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/561/400/300'], unitValue: 3, unit: 'kg', packaging: 'головка', description: 'Французский сыр ярко-оранжевого цвета. Имеет орехово-фруктовый вкус.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1650, priceTiers: {} },
  { id: 70, name: 'Аппенцеллер', pricePerUnit: 3000, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/562/400/300'], unitValue: 6, unit: 'kg', packaging: 'головка', description: 'Швейцарский твердый сыр, который во время созревания протирают травяным рассолом, что придает ему уникальный пряный аромат.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2300, priceTiers: {} },
  { id: 71, name: 'Норвежский Брюност', pricePerUnit: 900, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/563/400/300'], unitValue: 250, unit: 'g', packaging: 'упаковка', description: 'Карамельный сыр из козьей и коровьей сыворотки. Имеет сладкий вкус и консистенцию ириски.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 650, priceTiers: {} },
  { id: 72, name: 'Венслидейл', pricePerUnit: 2400, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/564/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Английский сыр, часто с клюквой. Рассыпчатый, с кисловатым медовым вкусом.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1800, priceTiers: {} },
  { id: 73, name: 'Глостер', pricePerUnit: 2300, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/565/400/300'], unitValue: 2, unit: 'kg', packaging: 'головка', description: 'Традиционный английский сыр. Single Gloucester более молодой, Double Gloucester - более выдержанный.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1700, priceTiers: {} },
  { id: 74, name: 'Каерфилли', pricePerUnit: 2200, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/566/400/300'], unitValue: 1.5, unit: 'kg', packaging: 'головка', description: 'Уэльский сыр с рассыпчатой текстурой и лимонным вкусом.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1650, priceTiers: {} },
  { id: 75, name: 'Ланкашир', pricePerUnit: 2100, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/567/400/300'], unitValue: 2, unit: 'kg', packaging: 'головка', description: 'Английский рассыпчатый сыр с острым вкусом, идеально подходит для поджаривания.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1550, priceTiers: {} },
  { id: 76, name: 'Красный Лестер', pricePerUnit: 1950, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/568/400/300'], unitValue: 3, unit: 'kg', packaging: 'головка', description: 'Английский сыр, похожий на Чеддер, но более рассыпчатый и окрашенный аннато в оранжевый цвет.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1450, priceTiers: {} },
  { id: 77, name: 'Двойной Глостер с луком и травами', pricePerUnit: 2500, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/569/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Классический Глостер с добавлением рубленого лука и трав для пикантности.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1900, priceTiers: {} },
  { id: 78, name: 'Чеширский', pricePerUnit: 2250, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/570/400/300'], unitValue: 2.5, unit: 'kg', packaging: 'головка', description: 'Один из старейших английских сыров. Рассыпчатый, влажный, с легким соленым вкусом.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1700, priceTiers: {} },
  { id: 79, name: 'Салерс', pricePerUnit: 2900, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/571/400/300'], unitValue: 40, unit: 'kg', packaging: 'головка', description: 'Французский фермерский сыр, похожий на Канталь. Имеет травянистый, пряный вкус.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2200, priceTiers: {} },
  { id: 80, name: 'Канталь', pricePerUnit: 2700, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/572/400/300'], unitValue: 35, unit: 'kg', packaging: 'головка', description: 'Один из древнейших французских сыров. Вкус от молочного до острого в зависимости от выдержки.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2050, priceTiers: {} },
  { id: 81, name: 'Морбье', pricePerUnit: 2600, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/573/400/300'], unitValue: 6, unit: 'kg', packaging: 'головка', description: 'Полумягкий сыр с характерной прослойкой из золы посередине. Имеет фруктовый аромат и эластичную текстуру.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1950, priceTiers: {} },
  { id: 82, name: 'Шабишу-дю-Пуату', pricePerUnit: 700, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/574/400/300'], unitValue: 150, unit: 'g', packaging: 'штука', description: 'Знаменитый козий сыр в форме бочонка. Имеет сладковатый вкус с нотками козьего молока.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 530, priceTiers: {} },
  { id: 83, name: 'Сель-сюр-Шер', pricePerUnit: 750, categories: ['Козьи и овечьи', 'С плесенью'], imageUrls: ['https://picsum.photos/id/575/400/300'], unitValue: 150, unit: 'g', packaging: 'штука', description: 'Козий сыр в золе в форме диска. Солоноватый, с ореховым послевкусием.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 580, priceTiers: {} },
  { id: 84, name: 'Кер-де-Шевр', pricePerUnit: 600, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/576/400/300'], unitValue: 120, unit: 'g', packaging: 'штука', description: 'Свежий козий сыр в форме сердца. Нежный, с легкой кислинкой.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 450, priceTiers: {} },
  { id: 85, name: 'Кабра аль Вино', pricePerUnit: 2800, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/577/400/300'], unitValue: 2.2, unit: 'kg', packaging: 'головка', description: 'Испанский козий сыр, который вымачивают в красном вине. Корочка имеет фиолетовый оттенок, а вкус - фруктовый.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2100, priceTiers: {} },
  { id: 86, name: 'Робиола', pricePerUnit: 650, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/578/400/300'], unitValue: 150, unit: 'g', packaging: 'упаковка', description: 'Итальянский мягкий сыр, может быть из коровьего, козьего, овечьего молока или их смеси. Кисло-сладкий вкус.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 490, priceTiers: {} },
  { id: 87, name: 'Крешенца', pricePerUnit: 550, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/579/400/300'], unitValue: 200, unit: 'g', packaging: 'упаковка', description: 'Очень мягкий итальянский сыр без корочки с нежным молочным вкусом.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 410, priceTiers: {} },
  { id: 88, name: 'Сент-Агюр', pricePerUnit: 3100, categories: ['С плесенью'], imageUrls: ['https://picsum.photos/id/580/400/300'], unitValue: 2.2, unit: 'kg', packaging: 'головка', description: 'Французский голубой сыр с двойной долей сливок. Кремовый, маслянистый, менее соленый, чем другие голубые сыры.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2400, priceTiers: {} },
  { id: 89, name: 'Камбоцола', pricePerUnit: 2900, categories: ['С плесенью', 'Мягкие'], imageUrls: ['https://picsum.photos/id/581/400/300'], unitValue: 2.2, unit: 'kg', packaging: 'головка', description: 'Немецкий гибрид камамбера и горгонзолы. Сочетает мягкость бри и пикантность голубого сыра.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2200, priceTiers: {} },
  { id: 90, name: 'Шаурс', pricePerUnit: 800, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/582/400/300'], unitValue: 250, unit: 'g', packaging: 'штука', description: 'Французский мягкий сыр с пушистой корочкой и грибным ароматом.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 620, priceTiers: {} },
  { id: 91, name: 'Нёшатель', pricePerUnit: 650, categories: ['Мягкие'], imageUrls: ['https://picsum.photos/id/583/400/300'], unitValue: 200, unit: 'g', packaging: 'штука', description: 'Нормандский сыр в форме сердца. Солоноватый, с грибным привкусом.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 480, priceTiers: {} },
  { id: 92, name: 'Лайоль', pricePerUnit: 2750, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/584/400/300'], unitValue: 45, unit: 'kg', packaging: 'головка', description: 'Французский прессованный невареный сыр. Молочный вкус с нотами мяты и лесного ореха.', allowedPortions: ['whole', 'half', 'quarter'], status: ProductStatus.Available, costPrice: 2100, priceTiers: {} },
  { id: 93, name: 'Абонданс', pricePerUnit: 2850, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/585/400/300'], unitValue: 10, unit: 'kg', packaging: 'головка', description: 'Французский полутвердый сыр с вогнутыми краями. Сложный вкус с фруктовыми и ореховыми нотами.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2150, priceTiers: {} },
  { id: 94, name: 'Банон', pricePerUnit: 950, categories: ['Козьи и овечьи'], imageUrls: ['https://picsum.photos/id/586/400/300'], unitValue: 100, unit: 'g', packaging: 'штука', description: 'Французский козий сыр, завернутый в каштановые листья и перевязанный лентой. Интенсивный, сложный вкус.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 750, priceTiers: {} },
  { id: 95, name: 'Панир', pricePerUnit: 700, categories: ['Свежие'], imageUrls: ['https://picsum.photos/id/587/400/300'], unitValue: 500, unit: 'g', packaging: 'упаковка', description: 'Индийский свежий сыр, который не плавится при жарке. Основа многих вегетарианских блюд.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 500, priceTiers: {} },
  { id: 96, name: 'Котиха', pricePerUnit: 1800, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/588/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Мексиканский твердый сыр. Очень соленый и рассыпчатый, используется как посыпка.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1350, priceTiers: {} },
  { id: 97, name: 'Оахака', pricePerUnit: 950, categories: ['Рассольные'], imageUrls: ['https://picsum.photos/id/589/400/300'], unitValue: 500, unit: 'g', packaging: 'штука', description: 'Мексиканский сыр, похожий на моцареллу, скрученный в клубок. Хорошо плавится.', allowedPortions: ['whole'], status: ProductStatus.Available, costPrice: 700, priceTiers: {} },
  { id: 98, name: 'Шропшир Блю', pricePerUnit: 3400, categories: ['С плесенью'], imageUrls: ['https://picsum.photos/id/590/400/300'], unitValue: 8, unit: 'kg', packaging: 'головка', description: 'Английский голубой сыр, подкрашенный аннато в оранжевый цвет. Похож на Стилтон, но мягче.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 2700, priceTiers: {} },
  { id: 99, name: 'Ярлсберг', pricePerUnit: 1750, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/591/400/300'], unitValue: 10, unit: 'kg', packaging: 'головка', description: 'Норвежский сыр с крупными глазками, похожий на Эмменталь, но более мягкий и сладкий.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 1300, priceTiers: {} },
  { id: 100, name: 'Пошехонский копченый', pricePerUnit: 850, categories: ['Твердые'], imageUrls: ['https://picsum.photos/id/592/400/300'], unitValue: 1, unit: 'kg', packaging: 'головка', description: 'Классический Пошехонский сыр, подвергнутый натуральному копчению для придания дымного аромата.', allowedPortions: ['whole', 'half'], status: ProductStatus.Available, costPrice: 620, priceTiers: {} }
];



const TruckIcon: React.FC<{ className?: string; itemCount?: number }> = ({ className, itemCount = 0 }) => {
    const MAX_BOXES = 15; // 5 columns, 3 rows
    const colors = ['#FBBF24', '#34D399', '#60A5FA', '#F87171', '#A78BFA'];

    const renderBoxes = () => {
        const boxes = [];
        const numBoxes = Math.min(itemCount, MAX_BOXES);
        
        const bedX = 1.5;
        const bedWidth = 11;
        const bedHeight = 4;
        const bedBottomY = 16.5;

        const boxSize = 2;
        const boxSpacing = 0.2;
        const cols = 5;
        
        for (let i = 0; i < numBoxes; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            const x = bedX + col * (boxSize + boxSpacing);
            const y = bedBottomY - (row + 1) * (boxSize + boxSpacing) + boxSpacing;

            boxes.push(
                <rect 
                    key={i} 
                    x={x} 
                    y={y} 
                    width={boxSize} 
                    height={boxSize} 
                    fill={colors[i % colors.length]}
                    rx="0.2"
                />
            );
        }
        return boxes;
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            {/* Render boxes inside the cargo area */}
            {renderBoxes()}
            
            {/* Truck outline */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 17h2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 17h5.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 17h2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 12h12v5H1z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 12l3-4h5v9h-8v-5z" />
            <circle cx="5" cy="19" r="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="19" r="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};


const UserIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AdminIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ImageIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ImageOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
);

interface FlyingItemProps {
  imageUrl: string;
  startRect: DOMRect;
  endRect?: DOMRect;
  onAnimationEnd: () => void;
}

const FlyingItem: React.FC<FlyingItemProps> = ({ imageUrl, startRect, endRect, onAnimationEnd }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        height: startRect.height,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '0.375rem',
        zIndex: 1000,
        opacity: 1,
        transition: 'transform 0.5s cubic-bezier(0.5, -0.5, 1, 1), opacity 0.5s ease-out',
    });

    useEffect(() => {
        if (!endRect) return;

        const x = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
        const y = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
        
        requestAnimationFrame(() => {
            setStyle(s => ({
                ...s,
                transform: `translate(${x}px, ${y}px) scale(0.1)`,
                opacity: 0,
            }));
        });
        
        const timer = setTimeout(onAnimationEnd, 500); // Animation duration
        return () => clearTimeout(timer);
    }, [endRect, onAnimationEnd, startRect]);

    return <div style={style} />;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        let parsed = JSON.parse(savedProducts);
        // Migration for users with old data structures
        if (parsed.length > 0 && (parsed[0].hasOwnProperty('isVisible') || parsed[0].hasOwnProperty('pricePerKg'))) {
            return parsed.map((p: any) => {
                const { isPromotion, ...rest } = p;
                return {
                    id: p.id,
                    name: p.name,
                    pricePerUnit: p.pricePerUnit || p.pricePerKg || 0,
                    categories: p.categories || (p.category ? [p.category] : []),
                    imageUrls: p.imageUrls || [],
                    unitValue: p.unitValue || p.weight || 1,
                    unit: p.unit || 'kg',
                    packaging: p.packaging || 'головка',
                    description: p.description || '',
                    allowedPortions: p.allowedPortions || ['whole'],
                    status: p.hasOwnProperty('isVisible') ? (p.isVisible ? ProductStatus.Available : ProductStatus.Hidden) : (p.status || ProductStatus.Available),
                    priceOverridesPerUnit: p.priceOverridesPerUnit || p.priceOverridesPerKg || p.portionPrices || {},
                    costPrice: p.costPrice,
                    usp1Price: p.usp1Price,
                    usp1UseGlobalMarkup: p.usp1UseGlobalMarkup !== false,
                    badge: p.badge || (isPromotion ? 'ХИТ' : undefined),
                    priceTiers: p.priceTiers || {},
                };
            });
        }
         // ensure new structure exists on clean data
        return parsed.map((p: any) => {
          const { isPromotion, ...rest } = p;
          return {
            ...rest, 
            badge: p.badge || (isPromotion ? 'ХИТ' : undefined),
            priceOverridesPerUnit: p.priceOverridesPerUnit || {},
            usp1UseGlobalMarkup: p.usp1UseGlobalMarkup !== false,
            priceTiers: p.priceTiers || {},
          }
        });
    }
    return INITIAL_PRODUCTS.map(p => ({...p, priceTiers: p.priceTiers || {} }));
  });
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [orders, setOrders] = useState<Order[]>([]);
  const [galleryModalInfo, setGalleryModalInfo] = useState<{images: string[], index: number} | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>(() => {
      const uniqueCategories = new Set(INITIAL_CATEGORIES);
      products.forEach(p => p.categories.forEach(c => uniqueCategories.add(c)));
      return Array.from(uniqueCategories).sort();
  });
  const [flyingItems, setFlyingItems] = useState<{ id: number; imageUrl: string; startRect: DOMRect }[]>([]);
  const [showProductImages, setShowProductImages] = useState(true);
  
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const { 
    currentUser, 
    logout, 
    updateUserDetails, 
    changePassword, 
    users,
    addUserByAdmin,
    deleteUserByAdmin,
    updateUserByAdmin,
  } = useContext(AuthContext);
  
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    // If user is not an admin, force shop view
    if (view === 'admin' && !currentUser?.isAdmin) {
      setView('shop');
    }
  }, [view, currentUser]);
  
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const parsedOrders: Order[] = JSON.parse(savedOrders);
      // Add default status to old orders for migration
      const ordersWithStatus = parsedOrders.map(o => ({...o, status: o.status || OrderStatus.New }));
      setOrders(ordersWithStatus);
    }
  }, []);

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(order => order.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, currentUser]);

  const totalItemsInCart = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalCartSum = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const totalCartWeight = useMemo(() => {
    return cartItems.reduce((sum, item) => {
        let weightInKg = 0;
        if (item.unit === 'kg') weightInKg = item.unitValue;
        if (item.unit === 'g') weightInKg = item.unitValue / 1000;
        return sum + (weightInKg * item.quantity);
    }, 0);
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    const visibleProducts = products.filter(p => p.status !== ProductStatus.Hidden);

    let filtered = visibleProducts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categories.includes(selectedCategory));
    }
    
    if (searchTerm.trim() !== '') {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowercasedSearchTerm) || 
            p.description.toLowerCase().includes(lowercasedSearchTerm)
        );
    }
    
    return filtered;
  }, [selectedCategory, products, searchTerm]);
  
  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }

  const handleAddToCart = (product: Product, portion: ProductPortion, startRect?: DOMRect) => {
    if (startRect) {
        setFlyingItems(prev => [...prev, {
            id: Date.now(),
            imageUrl: product.imageUrls[0],
            startRect,
        }]);
    }
    const cartItemId = `${product.id}-${portion}`;

    const getPriceInfoForPortion = (p: Product, por: ProductPortion) => {
      const basePricePerUnit = p.pricePerUnit || 0;
      const baseUnitValue = p.unitValue || 0;
      let effectivePricePerUnit = basePricePerUnit;
      let portionValue = 0;

      switch (por) {
          case 'whole':
              effectivePricePerUnit = basePricePerUnit;
              portionValue = baseUnitValue;
              break;
          case 'half':
              effectivePricePerUnit = p.priceOverridesPerUnit?.half ?? basePricePerUnit;
              portionValue = baseUnitValue / 2;
              break;
          case 'quarter':
              effectivePricePerUnit = p.priceOverridesPerUnit?.quarter ?? basePricePerUnit;
              portionValue = baseUnitValue / 4;
              break;
      }
      return { price: effectivePricePerUnit * portionValue, unitValue: portionValue };
    };

    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.cartId === cartItemId);

        if (existingItem) {
            return prevItems.map(item =>
                item.cartId === cartItemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            const { price, unitValue } = getPriceInfoForPortion(product, portion);
            const newCartItem: CartItem = {
                cartId: cartItemId,
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrls[0],
                unit: product.unit,
                portion: portion,
                quantity: 1,
                price: price,
                unitValue: unitValue,
            };
            return [...prevItems, newCartItem];
        }
    });
  };

  const handleUpdateCartItemQuantity = (cartId: string, newQuantity: number) => {
    setCartItems(prevItems => {
        if (newQuantity <= 0) {
            return prevItems.filter(item => item.cartId !== cartId);
        }
        return prevItems.map(item =>
            item.cartId === cartId
                ? { ...item, quantity: newQuantity }
                : item
        );
    });
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handlePlaceOrder = (): 'placed' | undefined => {
    if (!currentUser) {
        setIsCartOpen(false);
        handleOpenAuthModal('login');
        return;
    }
    
    const getPortionName = (portion: ProductPortion) => {
        if (portion === 'half') return ' (Половинка)';
        if (portion === 'quarter') return ' (Четвертинка)';
        return '';
    };

    const newOrder: Order = {
        id: new Date().toISOString(),
        userId: currentUser.id,
        date: new Date().toISOString(),
        status: OrderStatus.New,
        items: cartItems.map(item => ({
            productId: item.id,
            name: `${item.name}${getPortionName(item.portion)}`,
            quantity: item.unitValue * item.quantity,
            price: item.price * item.quantity,
        })),
        totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalWeight: cartItems.reduce((sum, item) => {
            let weightInKg = 0;
            if (item.unit === 'kg') weightInKg = item.unitValue;
            if (item.unit === 'g') weightInKg = item.unitValue / 1000;
            return sum + (weightInKg * item.quantity);
        }, 0),
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    return 'placed';
  };
  
    const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        const updatedOrders = orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
    };

  const updateGlobalCategories = (newCats: string[]) => {
    setAllCategories(prevGlobalCats => {
        const updatedCategorySet = new Set(prevGlobalCats);
        newCats.forEach(c => {
            if (c && c.trim()) {
                updatedCategorySet.add(c.trim());
            }
        });
        return Array.from(updatedCategorySet).sort();
    });
  };

  const handleAddNewProduct = (newProductData: Omit<Product, 'id' | 'status'>) => {
    setProducts(prevProducts => {
        const newProduct: Product = {
            ...newProductData,
            id: Date.now(), // Simple ID generation
            status: ProductStatus.Available,
        };
        return [...prevProducts, newProduct];
    });
    updateGlobalCategories(newProductData.categories);
  };
  
  const handleBulkAddProducts = (newProductsData: Omit<Product, 'id' | 'status'>[]) => {
    const newProducts: Product[] = newProductsData.map((p, i) => ({
        ...p,
        id: Date.now() + i, // Simple unique ID generation for bulk import
        status: ProductStatus.Available,
    }));

    setProducts(prevProducts => [...prevProducts, ...newProducts]);

    const allNewCategories = newProductsData.flatMap(p => p.categories);
    updateGlobalCategories(allNewCategories);
  };

  const handleDeleteProduct = (productId: number) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return; 

    const isConfirmed = window.confirm(`Точно хотите удалить товар "${productToDelete.name}"? Это действие необратимо.`);
    if (isConfirmed) {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    }
  };

  const handleCycleProductStatus = (productId: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          let newStatus: ProductStatus;
          switch (p.status) {
            case ProductStatus.Available:
              newStatus = ProductStatus.OutOfStock;
              break;
            case ProductStatus.OutOfStock:
              newStatus = ProductStatus.Hidden;
              break;
            case ProductStatus.Hidden:
              newStatus = ProductStatus.Available;
              break;
            default:
              newStatus = p.status;
          }
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleUpdateProductPortions = (productId: number, portion: ProductPortion) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          // 'whole' is always required and cannot be toggled off.
          if (portion === 'whole') return p; 

          const newPortions = p.allowedPortions.includes(portion)
            ? p.allowedPortions.filter(item => item !== portion)
            : [...p.allowedPortions, portion];
          
          return { ...p, allowedPortions: newPortions };
        }
        return p;
      })
    );
  };
  
  const handleUpdateProductPrices = (productId: number, newPrices: { pricePerUnit: number, priceOverridesPerUnit: Product['priceOverridesPerUnit'] }) => {
    setProducts(prevProducts =>
        prevProducts.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    pricePerUnit: newPrices.pricePerUnit,
                    priceOverridesPerUnit: newPrices.priceOverridesPerUnit,
                };
            }
            return p;
        })
    );
  };

  const handleUpdateProductPriceTiers = (productId: number, newPriceTiers: Product['priceTiers']) => {
    setProducts(prevProducts =>
        prevProducts.map(p => {
            if (p.id === productId) {
                return { ...p, priceTiers: newPriceTiers };
            }
            return p;
        })
    );
  };

  const handleUpdateProductCostPrice = (productId: number, newCostPrice?: number) => {
    setProducts(prevProducts =>
        prevProducts.map(p =>
            p.id === productId ? { ...p, costPrice: newCostPrice } : p
        )
    );
  };

  const handleUpdateProductUspPrices = (productId: number, newUspPrices: { costPrice?: number; usp1Price?: number; }) => {
    setProducts(prevProducts =>
        prevProducts.map(p =>
            p.id === productId ? { ...p, ...newUspPrices } : p
        )
    );
  };
  
  const handleBulkUpdateUspPrices = (updates: { productId: number; usp1Price?: number; }[]) => {
    const updateMap = new Map(updates.map(u => [u.productId, u]));
    setProducts(prevProducts =>
        prevProducts.map(p => {
            const update = updateMap.get(p.id);
            if (update) {
                return { ...p, ...update };
            }
            return p;
        })
    );
  };

  const handleBulkUpdateWholesalePrices = (updates: { productId: number; newPrice: number; }[]) => {
    const updateMap = new Map(updates.map(u => [u.productId, u.newPrice]));
    setProducts(prevProducts =>
        prevProducts.map(p => {
            if (updateMap.has(p.id)) {
                const newPrice = updateMap.get(p.id)!;
                const newPriceTiers = { ...(p.priceTiers || {}), 'оптовый': newPrice };
                return { ...p, priceTiers: newPriceTiers };
            }
            return p;
        })
    );
  };

  const handleUpdateProductUspMarkupFlags = (productId: number, flags: { usp1UseGlobalMarkup?: boolean; }) => {
    setProducts(prevProducts =>
        prevProducts.map(p =>
            p.id === productId ? { ...p, ...flags } : p
        )
    );
  };

  const handleUpdateProductUnitValue = (productId: number, newUnitValue: number) => {
    setProducts(prevProducts =>
        prevProducts.map(p =>
            p.id === productId ? { ...p, unitValue: newUnitValue } : p
        )
    );
  };

  const handleUpdateProductDetails = (productId: number, newDetails: { name: string; description: string; unit: ProductUnit; packaging: ProductPackaging }) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, ...newDetails } : p
      )
    );
  };

  const handleUpdateProductImages = (productId: number, newImageUrls: string[]) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, imageUrls: newImageUrls } : p
      )
    );
  };
  
  const handleUpdateProductCategories = (productId: number, newCategories: string[]) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, categories: newCategories } : p
      )
    );
    updateGlobalCategories(newCategories);
  };

  const badgeCycle: (ProductBadge | undefined)[] = [undefined, 'ХИТ', 'акция', 'мало', 'много'];

  const handleCycleProductBadge = (productId: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === productId) {
          const currentBadgeIndex = badgeCycle.findIndex(b => b === p.badge);
          const nextBadgeIndex = (currentBadgeIndex + 1) % badgeCycle.length;
          return { ...p, badge: badgeCycle[nextBadgeIndex] };
        }
        return p;
      })
    );
  };

  const handleOpenGalleryModal = (images: string[], index: number) => {
    setGalleryModalInfo({ images, index });
  };

  const handleCloseGalleryModal = () => {
      setGalleryModalInfo(null);
  };
  
  const handleAnimationEnd = (id: number) => {
    setFlyingItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleAddUser = (email: string, password: string): 'success' | 'exists' => {
    return addUserByAdmin(email, password);
  };

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.isAdmin) {
        alert('Нельзя удалить администратора.');
        return;
    }

    const isConfirmed = window.confirm(`Точно хотите удалить пользователя "${userToDelete.email}"? Это действие необратимо.`);
    if (isConfirmed) {
        deleteUserByAdmin(userId);
    }
  };

  const handleUpdateUserByAdmin = (userId: number, updates: Partial<User> & { newPassword?: string }) => {
    updateUserByAdmin(userId, updates);
  };


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button
                    ref={cartIconRef}
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-gray-600 hover:text-indigo-600 focus:outline-none"
                    aria-label={`Открыть корзину, ${totalItemsInCart} шт.`}
                >
                    <TruckIcon className="w-10 h-10" itemCount={cartItems.length}/>
                    {totalItemsInCart > 0 && (
                        <span className="absolute -top-2 -right-3 flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                            {totalItemsInCart}
                        </span>
                    )}
                </button>
                {cartItems.length > 0 && (
                     <div className="flex flex-col text-xs tabular-nums text-gray-600 border-l border-gray-200 pl-3">
                        <div><span className="text-gray-500">Позиций:</span> <span className="font-semibold">{cartItems.length}</span></div>
                        <div><span className="text-gray-500">Вес, кг:</span> <span className="font-semibold">~{totalCartWeight.toFixed(2)}</span></div>
                        <div><span className="text-gray-500">Сумма, ₽:</span> <span className="font-semibold">{totalCartSum.toLocaleString('ru-RU')}</span></div>
                    </div>
                )}
            </div>
            
          <div className="flex items-center gap-4">
             {currentUser ? (
                 <div className="flex items-center gap-4">
                    {currentUser.isAdmin && (
                        <button onClick={() => setView(view === 'admin' ? 'shop' : 'admin')} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600" aria-label="Админ панель">
                            <AdminIcon className="w-6 h-6"/>
                            <span className="hidden sm:inline">{view === 'admin' ? 'В магазин' : 'Админ панель'}</span>
                        </button>
                    )}
                     <button onClick={() => setAccountModalOpen(true)} className="text-gray-600 hover:text-indigo-600 focus:outline-none" aria-label="Личный кабинет">
                         <UserIcon className="w-8 h-8"/>
                     </button>
                     <button onClick={logout} className="text-sm font-medium text-gray-600 hover:text-indigo-600">Выйти</button>
                 </div>
             ) : (
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenAuthModal('login')} className="text-sm font-medium text-gray-600 hover:text-indigo-600">Войти</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleOpenAuthModal('register')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Регистрация</button>
                </div>
             )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
         {view === 'admin' && currentUser?.isAdmin ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Панель управления</h1>
              <AdminPage 
                products={products}
                allCategories={allCategories}
                orders={orders}
                allUsers={users}
                onAddProduct={handleAddNewProduct}
                onBulkAddProducts={handleBulkAddProducts}
                onDeleteProduct={handleDeleteProduct}
                onCycleStatus={handleCycleProductStatus}
                onUpdatePortions={handleUpdateProductPortions}
                onUpdatePrices={handleUpdateProductPrices}
                onUpdateProductPriceTiers={handleUpdateProductPriceTiers}
                onUpdateProductCostPrice={handleUpdateProductCostPrice}
                onUpdateUspPrices={handleUpdateProductUspPrices}
                onBulkUpdateUspPrices={handleBulkUpdateUspPrices}
                onBulkUpdateWholesalePrices={handleBulkUpdateWholesalePrices}
                onUpdateUspMarkupFlags={handleUpdateProductUspMarkupFlags}
                onUpdateUnitValue={handleUpdateProductUnitValue}
                onUpdateDetails={handleUpdateProductDetails}
                onUpdateImages={handleUpdateProductImages}
                onUpdateCategories={handleUpdateProductCategories}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onUpdateUserByAdmin={handleUpdateUserByAdmin}
                onCycleBadge={handleCycleProductBadge}
              />
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="self-start sm:self-center">
                        <CategoryDropdown
                            categories={allCategories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            displayAsIconButton={true}
                        />
                    </div>
                    <div className="relative w-full flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Поиск по названию или описанию..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full bg-gray-100 border border-transparent rounded-full py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            aria-label="Поиск по товарам"
                        />
                    </div>
                    <div className="self-end sm:self-center">
                        <button
                            onClick={() => setShowProductImages(s => !s)}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-shrink-0"
                            aria-label={showProductImages ? "Скрыть изображения товаров" : "Показать изображения товаров"}
                            title={showProductImages ? "Скрыть изображения" : "Показать изображения"}
                        >
                            {showProductImages ? <ImageOffIcon className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
              </div>
              <ProductList 
                products={filteredProducts} 
                onAddToCart={handleAddToCart}
                onOpenGalleryModal={handleOpenGalleryModal}
                showProductImages={showProductImages}
              />
            </>
          )}
      </main>

      {/* Cart Overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)} aria-hidden="true"></div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Cart
            cartItems={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onUpdateItemQuantity={handleUpdateCartItemQuantity}
            onClearCart={handleClearCart}
            onClose={() => setIsCartOpen(false)}
            onPlaceOrder={handlePlaceOrder}
          />
      </div>

      {isAuthModalOpen && (
          <AuthModal
              mode={authMode}
              onClose={() => setAuthModalOpen(false)}
              onSwitchMode={(newMode) => setAuthMode(newMode)}
          />
      )}

      {isAccountModalOpen && currentUser && (
          <AccountModal
            user={currentUser}
            orders={userOrders}
            onClose={() => setAccountModalOpen(false)}
            onUpdateDetails={updateUserDetails}
            onChangePassword={changePassword}
          />
      )}

      {galleryModalInfo && (
          <ImageGalleryModal 
              imageUrls={galleryModalInfo.images}
              initialIndex={galleryModalInfo.index}
              onClose={handleCloseGalleryModal}
          />
      )}
      
      {flyingItems.map(item => (
          <FlyingItem
              key={item.id}
              imageUrl={item.imageUrl}
              startRect={item.startRect}
              endRect={cartIconRef.current?.getBoundingClientRect()}
              onAnimationEnd={() => handleAnimationEnd(item.id)}
          />
      ))}
    </div>
  );
};

export default App;