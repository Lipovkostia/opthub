import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Order, Product, User } from '../types';

interface AdminAnalyticsProps {
    orders: Order[];
    products: Product[];
    users: User[];
}

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 5m0 14v-4m-2 2h4m-7-7l2.293-2.293a1 1 0 011.414 1.414L8 12.586l2.293-2.293a1 1 0 011.414 1.414L12 15.414l2.293-2.293a1 1 0 011.414 1.414L14 17m-4-11v4m2-2h-4" />
    </svg>
);


const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ orders, products, users }) => {
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    // Function to replace markdown-like syntax with HTML
    const formatReport = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Headers (##)
            if (line.startsWith('## ')) {
                return <h3 key={index} className="text-xl font-semibold text-gray-800 mt-4 mb-2">{line.substring(3)}</h3>;
            }
            if (line.startsWith('**') && line.endsWith('**')) {
                 return <p key={index} className="font-bold my-1">{line.substring(2, line.length - 2)}</p>;
            }
            // List items (-)
            if (line.startsWith('- ')) {
                return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
            }
             // Empty line
            if (line.trim() === '') {
                return null;
            }
            // Regular paragraph
            return <p key={index} className="mb-2">{line}</p>;
        });
    };


    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError('');
        setReport('');

        try {
            // 1. Prepare summarized data to reduce token count
            const productSummary = products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.pricePerUnit,
                categories: p.categories,
            }));

            const orderSummary = orders.map(o => ({
                userId: o.userId,
                totalAmount: o.totalAmount,
                items: o.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
                date: o.date,
            }));

            const userSummary = users.filter(u => !u.isAdmin).map(u => ({
                id: u.id,
                email: u.email,
                customerType: u.customerType,
            }));

            if (orderSummary.length === 0) {
                setError("Нет данных для анализа. Сначала должны появиться заказы.");
                setIsLoading(false);
                return;
            }

            // 2. Construct the prompt
            const prompt = `
                Ты — бизнес-аналитик в интернет-магазине сыров. Тебе предоставлены данные о товарах, заказах и клиентах в формате JSON. Твоя задача — проанализировать эти данные и предоставить краткий бизнес-отчет с практическими рекомендациями на русском языке.

                Отчет должен быть отформатирован с использованием базового Markdown (заголовки ## и списки -) и включать следующие разделы:
                - ## Общая сводка: Общая выручка, количество заказов, средний чек.
                - ## Популярные товары: Назови 3 самых продаваемых товара по сумме выручки.
                - ## Популярные категории: Назови 2 самые популярные категории.
                - ## Ключевые клиенты: Назови 2-3 лучших клиентов по общей сумме заказов.
                - ## Рекомендации: Дай 2-3 четкие, практические рекомендации по улучшению бизнеса (например, какие товары продвигать, какие пополнить, идеи для маркетинга).

                Вот данные для анализа:
                Товары: ${JSON.stringify(productSummary)}
                Заказы: ${JSON.stringify(orderSummary)}
                Клиенты: ${JSON.stringify(userSummary)}
            `;

            // 3. Call Gemini API
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setReport(response.text);

        } catch (e) {
            console.error("Error generating analytics report:", e);
            setError("Не удалось сгенерировать отчет. Пожалуйста, проверьте консоль на наличие ошибок или попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6" />
                Аналитика и инсайты
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center text-center">
                    <SparklesIcon className="w-12 h-12 text-indigo-500 mb-3" />
                    <h4 className="text-xl font-bold text-gray-800">AI-помощник по аналитике</h4>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                        Получите сводку по продажам, популярным товарам и поведению клиентов. Нажмите на кнопку, чтобы сгенерировать отчет на основе текущих данных о заказах.
                    </p>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                        className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Анализируем данные...
                            </>
                        ) : 'Сгенерировать отчет'}
                    </button>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {report && !isLoading && (
                    <div className="mt-8 pt-6 border-t">
                        <div className="prose prose-indigo max-w-none text-gray-700">
                             {formatReport(report)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;
