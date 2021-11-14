import { FC } from 'react';

const Container: FC = ({ children }) => {
  return <div className='max-w-screen-lg xl:max-w-screen-xl mx-auto space-y-20 sm:space-y-32 md:space-y-40 lg:space-y-44 min-h-full'>{children}</div>;
};

export default Container;
