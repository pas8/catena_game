import 'tailwindcss/tailwind.css';
import '../styles.css';
import type { AppProps } from 'next/app';
import { ComposeLayouts } from '../src/layouts';
import ProgressLayout from '../src/layouts/ProgressLayout';
import HeaderLayout from '../src/layouts/HeaderLayout';
import ToastifyLayout from '../src/layouts/ToastifyLayout';

const _App = ({ Component, pageProps }: AppProps) => {
  return (
    <div className='dark:bg-dark-42  min-h-screen w-min min-w-full '>
      <ComposeLayouts layouts={[ProgressLayout, HeaderLayout, ToastifyLayout]}>
        <Component {...pageProps} />
      </ComposeLayouts>
      <span
        className={
          'from-secondary-900 hover:to-secondary-600   hover:border-secondary-300 hover:via-secondary-800  border-secondary-600 bg-secondary-400  hover:bg-secondary-900   ring-secondary-400'
        }
      ></span>
        <span
        className={
          'from-primary-900 hover:to-primary-600 hover:border-primary-300 hover:via-primary-800 border-primary-600 bg-primary-400 hover:bg-primary-900 ring-primary-400 mb-2 m overflow-hidden'
        }
      ></span>
    </div>
  );
};
export default _App;
