import React from 'react';
import styled from '@emotion/styled';
import space from 'app/styles/space';

const TextBlock = styled(({noMargin, ...props}) => <div {...props} />)`
  line-height: 1.5;
  ${(p) => (p.noMargin ? '' : 'margin-bottom:' + space(3))};
`;

export default TextBlock;
