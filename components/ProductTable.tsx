
import React from 'react';
import { Product, ProductPortion, ProductUnit, ProductPackaging } from '../types';
import ProductTableRow from './ProductTableRow';

// Define props based on what AdminPanel will pass
interface ProductTableProps {
    products: Product[];
    allCategories: string[];
    onDeleteProduct: (productId: number) => void;
    onCycleStatus: (productId: number) => void;
    onUpdatePortions: (productId: number, portion: ProductPortion) => void;
    onUpdatePrices: (productId: number, newPrices: { pricePerUnit: number, priceOverridesPerUnit: Product['priceOverridesPerUnit'] }) => void;
    onUpdateUnitValue: (productId: number, newUnitValue: number) => void;
    onUpdateDetails: (productId: number, newDetails: { name: string; description: string; unit: ProductUnit; packaging: ProductPackaging; }) => void;
    onUpdateCategories: (productId: number, newCategories: string[]) => void;
    onUpdateImages: (productId: number, newImageUrls: string[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = (props) => {
    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                    <tr>
                        <th scope="col" className="py-3 px-2 w-16 text-center">Статус</th>
                        <th scope="col" className="py-3 px-2 min-w-[150px]">Фото</th>
                        <th scope="col" className="py-3 px-2 min-w-[200px]">Название</th>
                        <th scope="col" className="py-3 px-2 min-w-[250px]">Описание</th>
                        <th scope="col" className="py-3 px-2 min-w-[250px]">Категории</th>
                        <th scope="col" className="py-3 px-2 min-w-[150px]">Цена / Ед.Изм.</th>
                        <th scope="col" className="py-3 px-2 min-w-[150px]">Значение / Вид</th>
                        <th scope="col" className="py-3 px-2 min-w-[180px]">Порции (для кг)</th>
                        <th scope="col" className="py-3 px-2 min-w-[180px]">Спец. цены (для кг)</th>
                        <th scope="col" className="py-3 px-2 w-40 text-center">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {props.products.map(product => (
                        <ProductTableRow 
                            key={product.id}
                            product={product}
                            {...props}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
