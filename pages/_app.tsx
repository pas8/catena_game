import 'tailwindcss/tailwind.css';
import '../styles.css';
import type { AppProps } from 'next/app';
import { ComposeLayouts } from '../src/layouts';
import ProgressLayout from '../src/layouts/ProgressLayout';
import HeaderLayout from '../src/layouts/HeaderLayout';
import ToastifyLayout from '../src/layouts/ToastifyLayout';

const _App = ({ Component, pageProps }: AppProps) => {
  return (
    <div className='dark:bg-dark-42  min-h-screen'>
      <ComposeLayouts layouts={[ProgressLayout, HeaderLayout, ToastifyLayout]}>
        <Component {...pageProps} />
      </ComposeLayouts>
    </div>
  );
};
export default _App;
