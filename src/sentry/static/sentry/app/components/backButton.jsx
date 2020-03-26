import React from 'react';
import {Link} from 'react-router';
import InlineSvg from 'app/components/inlineSvg';
import styled from 'react-emotion';
import space from 'app/styles/space';

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${p => p.theme.gray3};
  background: ${p => p.theme.whiteDark};
  border-bottom: 1px solid ${p => p.theme.borderLight};
  padding: ${space(0.5)} ${space(0)};
  font-size: ${p => p.theme.fontSizeMedium};
  &:hover {
    color: ${p => p.theme.gray5};
  }
`;

const Icon = styled(InlineSvg)`
  margin: 0 6px 0 0px;
  background: ${p => p.theme.offWhite2};
  border-radius: 50%;
  padding: ${space(0.5)};
  box-sizing: content-box;

  /* To ensure proper vertical centering */
  svg {
    display: block;
  }
`;

export default function BackButton(props) {
  return (
    <StyledLink {...props}>
      <Icon src="icon-arrow-left" size="10px" />
      {props.children}
    </StyledLink>
  );
}
