import { FC } from 'react';
import Button from '../../components/Button';
import Logo from '../../components/Logo';

const HeaderLayout: FC = ({ children }) => {
  return (
    <>
      <header className={'header flex justify-between px-6 py-4 p'}>
        <div className={'flex items-center	gap-4 '}>
          <Logo className={'w-16 h-16'} />
          <h2 className={'uppercase text-4xl	font-bold dark:text-primary-200'}>Taxa token</h2>
        </div>
        <div className={'flex  items-center	gap-8'}>
          <nav className={'border-r-2 border-primary-100 p pr-8 flex items-center	gap-6 '}>
            {['Ecosystem', 'Buy', 'Community', 'Art'].map((name, idx) => (
              <a className={'dark:hover:text-primary-300 dark:text-white-42 text-xl'} href={'#' + name} key={idx + name}>
                {name}
              </a>
            ))}
          </nav>
          <Button>Taxa coin</Button>
        </div>
      </header>
      {children}
    </>
  );
};

export default HeaderLayout;