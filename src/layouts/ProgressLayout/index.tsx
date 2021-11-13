import NextNProgress from 'nextjs-progressbar';
import { FC } from 'react';

const ProgressLayout: FC = ({ children }) => {
  return (
    <>
      <NextNProgress color={'red'} />
      {children}
      <NextNProgress />
    </>
  );
};

export default ProgressLayout;
