import { FC, MouseEventHandler, useRef } from 'react';
const Button: FC<{
  _class?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isContained?: boolean;
  isSecondary?: boolean;
  rounded?: string;
}> = ({ children, _class, onClick, isContained = false, isSecondary = false, rounded = 'full', ...props }) => {
  const rippleRef = useRef({} as HTMLSpanElement);

  const on_click: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    const { clientX, currentTarget, clientY } = e;
    const x = clientX - currentTarget.getBoundingClientRect().left;
    const y = clientY - currentTarget.getBoundingClientRect().top;

    rippleRef.current.style.display = 'flex';
    rippleRef.current.style.left = x + 'px';
    rippleRef.current.style.top = y + 'px';
    setTimeout(() => {
      if (!!rippleRef?.current?.style?.display) rippleRef.current.style.display = 'none';
    }, 800);

    onClick && onClick(e);
  };
  const variant = isSecondary ? 'secondary' : 'primary';

  return (
    <button
      className={`rounded-${rounded}   py-3 px-6 p relative overflow-hidden text-xl duration-500  ring-${variant}-400 ring-opacity-50
        ${
          isContained
            ? `bg-gradient-to-r from-${variant}-900 to-dark-42 hover:from-dark-80  ring-2  hover:to-${variant}-600  hover:border-${variant}-300  text-white-42 hover:via-${variant}-800  border-2  border-${variant}-600`
            : `border-4 border-${variant}-400  text-white-42 hover:bg-${variant}-900  bg-opacity-20 ring-2`
        } ${_class || ''}`}
      {...props}
      onClick={on_click}
    >
      {children}
      <span className={'ripple'} ref={rippleRef} style={{ display: 'none' }}></span>
    </button>
  );
};

export default Button;
