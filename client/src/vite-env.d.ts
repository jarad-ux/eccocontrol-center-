
declare namespace JSX {
  interface IntrinsicElements {
    'zapier-mcp': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'embed-id'?: string;
      width?: string;
      height?: string;
      'class-name'?: string;
      'sign-up-email'?: string;
      'sign-up-first-name'?: string;
      'sign-up-last-name'?: string;
    }, HTMLElement>;
  }
}
