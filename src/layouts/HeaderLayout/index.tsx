import { FC } from 'react';
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
const Text = dynamic(() => import('../../components/HeaderText'), { ssr: false });

const HeaderLayout: FC = ({ children }) => {
  const { reload, push, query } = useRouter();
  const is_language_ua = Object.keys(query)?.[0] === 'ua';

  return (
    <>
      <header
        className={
          'header flex justify-between px-6 py-4 p bg-secondary-400 bg-opacity-10 fixed right-0 left-0 z-20  backdrop-blur-md backdrop-filter '
        }
      >
        <button
          className={
            ' text-3xl flex gap-2	font-bold dark:text-secondary-200 p-2 px-3 hover:bg-secondary-200 hover:bg-opacity-20 focus:outline-white ring-2 ring-secondary-200 ring-opacity-30 rounded-2xl'
          }
          onClick={() => reload()}
        >
          <svg viewBox={'0 0 630 620'} xmlns='http://www.w3.org/2000/svg' className={'w-8'}>
            <g transform='matrix(3.7795276,0,0,3.7795276,-68.505838,-75.591871)'>
              <path
                fill={'currentColor'}
                d='m 58.161525,184.11938 c -0.36791,-0.0928 -0.66892,-0.21949 -0.66892,-0.28147 0,-0.062 5.0009,-9.55281 11.11311,-21.09071 6.11221,-11.53789 11.14344,-21.1021 11.1805,-21.25379 0.0371,-0.15169 -11.71514,-7.89413 -26.11601,-17.20541 -34.12164,-22.0623 -35.54052,-22.99178 -35.5447,-23.28462 -0.005,-0.36312 8.62502,-5.902706 111.966715,-71.86962 l 14.30812,-9.133411 20.25897,0.0191 c 11.14243,0.0105 20.2931,0.05927 20.33482,0.108376 0.0759,0.08932 -16.39491,31.620837 -32.49244,62.203179 -4.70301,8.93485 -10.28127,19.334326 -12.39615,23.109966 -3.28307,5.86116 -3.77131,6.95089 -3.33958,7.45367 0.9017,1.05009 43.89021,70.78847 43.7196,70.92439 -0.20765,0.16544 -121.676665,0.4637 -122.324035,0.30036 z'
                id='path5436'
              />
            </g>
          </svg>
          <Text />
        </button>
        <div className={'flex items-center	gap-3 '}>
          <button
            className={
              ' text-2xl	font-bold dark:text-secondary-200 p-2 h-full w-14  hover:bg-secondary-200 hover:bg-opacity-20 focus:outline-white ring-2 ring-secondary-200 ring-opacity-30 rounded-2xl'
            }
            onClick={() => push(!is_language_ua ? '/?ua' : '/')}
          >
            {!is_language_ua ? 'EN' : 'UA'}
          </button>

          <button
            className={
              ' text-3xl	font-bold dark:text-secondary-200 p-2  hover:bg-secondary-200 hover:bg-opacity-20 focus:outline-white ring-2 ring-secondary-200 ring-opacity-30 rounded-2xl'
            }
            onClick={() => push('https://github.com/pas8/catena_game')}
          >
            <svg viewBox='151 64 24 24' className={'w-9 h-full'} fill={'currentColor'}>
              <path d='m159 71.829v8.342c-1.165.412-2 1.524-2 2.829 0 1.656 1.344 3 3 3s3-1.344 3-3c0-1.305-.835-2.417-2-2.829v-1.171h4c2.209 0 4-1.791 4-4v-1.171c1.165-.412 2-1.524 2-2.829 0-1.656-1.344-3-3-3s-3 1.344-3 3c0 1.305.835 2.417 2 2.829v1.171c0 1.105-.895 2-2 2h-4v-5.171c1.165-.412 2-1.524 2-2.829 0-1.656-1.344-3-3-3s-3 1.344-3 3c0 1.305.835 2.417 2 2.829zm1 10.171c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm8-12c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm-8-2c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z'></path>
            </svg>
          </button>
        </div>
      </header>
      {children}
    </>
  );
};

export default HeaderLayout;
