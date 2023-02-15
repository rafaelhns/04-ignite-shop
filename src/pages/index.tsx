import { GetStaticProps } from "next"
import Image from "next/image"
import { useKeenSlider } from "keen-slider/react"
import { HomeContainer, Product, ProductFooter } from "@/styles/pages/home"

import 'keen-slider/keen-slider.min.css'
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import Link from "next/link"
import Head from "next/head"
import { Handbag } from "phosphor-react"
import { ShoppingCartTrigger } from "@/components/ShoppingCartDialog"

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[]
}

export default function Home(props: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  });

  return (
    <>
      <Head>
        <title>Ignite Shop</title>
      </Head>

      <HomeContainer ref={sliderRef} className="keen-slider">
        {
          props.products.map(product => (
            <Product key={product.id} className="keen-slider__slide">
              <Link href={`/product/${product.id}`} prefetch={false}>
                <Image src={product.imageUrl} width={520} height={480} alt="" />
              </Link>

              <ProductFooter>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </div>

                <ShoppingCartTrigger>
                  <Handbag weight="bold" size={32} />
                </ShoppingCartTrigger>
              </ProductFooter>
            </Product>
          ))
        }
      </HomeContainer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  });

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price.unit_amount! / 100)
    }
  });

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2
  }
}
