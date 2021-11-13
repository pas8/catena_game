import NextNProgress from 'nextjs-progressbar';
import { FC } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const ToastifyLayout: FC = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export default ToastifyLayout;
