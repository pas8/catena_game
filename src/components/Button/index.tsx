import { FC, MouseEventHandler, useRef } from 'react';
const Button: FC<{ _class?: string; onClick?: MouseEventHandler<HTMLButtonElement>; isContained?: boolean }> = ({
  children,
  _class,
  onClick,
  isContained = false,
  ...props
}) => {
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

  return (
    <button
      className={`${
        _class || ''
      }rounded-full   py-3 px-6 p relative overflow-hidden text-xl duration-500  ring-primary-400 ring-opacity-50
        ${
          isContained
            ? 'bg-gradient-to-r from-primary-900 to-dark-42 hover:from-dark-80  ring-2  hover:to-primary-600  hover:border-primary-300  dark:text-white-42 hover:via-primary-800  border-2  border-primary-600'
            : 'border-4 border-primary-400  dark:text-white-42 hover:bg-primary-900  bg-opacity-20 ring-2'
        }`}
      {...props}
      onClick={on_click}
    >
      {children}
      <span className={'ripple'} ref={rippleRef} style={{ display: 'none' }}></span>
    </button>
  );
};

export default Button;
