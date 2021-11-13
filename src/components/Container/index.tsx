import { FC } from 'react';

const Container: FC = ({ children }) => {
  return <div className='max-w-screen-lg xl:max-w-screen-xl mx-auto space-y-20 sm:space-y-32 md:space-y-40 lg:space-y-44'>{children}</div>;
};

export default Container;
