import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { ProductCartProps, useCartStore } from '@/stores/CartStore';

import { formatCurrency } from '@/utils/functions/format-currency';

import { Header } from '@/components/Header';
import { Product } from '@/components/Product';
import { Input } from '@/components/Input';
import {
	BackMenuButton,
	Button,
	ButtonIcon,
	ButtonText,
} from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from 'expo-router';

const PHONE_NUMBER = '551199999999';

const Cart = () => {
	const [deliveryAddress, setDeliveryAddress] = useState('');

	const cartStore = useCartStore();

	const navigation = useNavigation();

	const total = formatCurrency(
		cartStore.products.reduce((accum, curr) => {
			return accum + curr.price * curr.quantity;
		}, 0)
	);

	function handleProductRemove(product: ProductCartProps) {
		Alert.alert('Remove', `Do you wish to remove ${product.title} from cart?`, [
			{
				text: 'Cancel',
			},
			{
				text: 'Remove',
				onPress: () => cartStore.removeFromCart(product.id),
			},
		]);
	}

	function handleSendOrder() {
		if (!deliveryAddress.trim()) {
			return Alert.alert('Order', 'Provide the delivery address details.');
		}

		const products = cartStore.products
			.map(product => `\n ${product.quantity}x ${product.title}`)
			.join('');

		const message = `🍔 New Order 🥤
    \n Delivery address: ${deliveryAddress}  
    ${products}
    \n Total value: ${total}
    `;

		const supportedURL = `https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${message}`;

		Linking.openURL(supportedURL);

		cartStore.clearCart();

		navigation.goBack();
	}

	return (
		<View className='flex-1 pt-8 mx-5'>
			<Header title='Your cart' />

			{cartStore.products.length ? (
				<View className='flex-1 mt-3'>
					<KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
						<ScrollView>
							<View className='border-b border-slate-700'>
								{cartStore.products.map(product => (
									<Product
										key={product.id}
										data={product}
										activeOpacity={1}
										deleteButton={() => handleProductRemove(product)}
									/>
								))}
							</View>
						</ScrollView>
					</KeyboardAwareScrollView>

					<View className='flex-row items-center gap-2 mb-4 pt-5'>
						<Text className='font-subtitle text-xl text-white'>Total:</Text>

						<Text className='font-heading text-2xl text-lime-400'>{total}</Text>
					</View>

					<Input
						placeholder='Provide the delivery address with street, number, complement, neighborhood, and ZIP code...'
						onChangeText={setDeliveryAddress}
					/>
				</View>
			) : (
				<View className='flex-1 items-center justify-center'>
					<Text className='font-body text-center text-slate-400'>
						Your cart is empty!
					</Text>
				</View>
			)}

			<View className='gap-5 mt-1'>
				{cartStore.products.length && (
					<Button onPress={handleSendOrder}>
						<ButtonText>Send order</ButtonText>
						<ButtonIcon>
							<Feather name='arrow-right-circle' size={20} />
						</ButtonIcon>
					</Button>
				)}

				<BackMenuButton title='Return to menu' href='/' />
			</View>
		</View>
	);
};

export default Cart;
