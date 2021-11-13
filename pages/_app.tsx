import 'tailwindcss/tailwind.css';
import '../styles.css';
import type { AppProps } from 'next/app';
import { ComposeLayouts } from '../src/layouts';
import ProgressLayout from '../src/layouts/ProgressLayout';
import HeaderLayout from '../src/layouts/HeaderLayout';

const _App = ({ Component, pageProps }: AppProps) => {
  return (
    <div className='dark:bg-dark-42  '>
      <ComposeLayouts layouts={[ProgressLayout, HeaderLayout]}>
        <Component {...pageProps} />
      </ComposeLayouts>
    </div>
  );
};
export default _App;
