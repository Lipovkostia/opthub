import React from 'react';
import { User, Order } from '../types';

interface AccountModalProps {
    user: User;
    orders: Order[];
    onClose: () => void;
}

const XIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const AccountModal: React.FC<AccountModalProps> = ({ user, orders, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" role="dialog" aria-modal="true">
                 <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Личный кабинет</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">История заказов</h3>
                    {orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3 pb-3 border-b">
                                        <div>
                                            <p className="font-semibold">Заказ от {new Date(order.date).toLocaleDateString('ru-RU')}</p>
                                            <p className="text-xs text-gray-500">ID: {order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{order.totalAmount.toLocaleString('ru-RU')} ₽</p>
                                            <p className="text-sm text-gray-500">{order.totalWeight.toFixed(2)} кг</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        {order.items.map((item, index) => (
                                            <li key={`${item.productId}-${index}`} className="flex justify-between">
                                                <span>{item.name} <span className="text-gray-500">x {item.quantity.toFixed(2)} кг</span></span>
                                                <span>{item.price.toLocaleString('ru-RU')} ₽</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">У вас еще нет заказов.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountModal;