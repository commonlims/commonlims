// Built on https://github.com/bpmn-io/react-bpmn/tree/53dc5df

// Original license:
// The MIT License (MIT)

// Copyright (c) 2019-present Camunda Services GmbH

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
import BpmnViewer from 'bpmn-js';
import PropTypes from 'prop-types';

export default class Bpmn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const {xml} = this.props;

    const container = this.containerRef.current;

    this.handleLoading();

    this.bpmnViewer = new BpmnViewer({container});

    this.bpmnViewer.on('import.done', event => {
      const {error, warnings} = event;

      if (error) {
        this.handleError(error);
      }

      this.bpmnViewer.get('canvas').zoom('fit-viewport');

      this.handleShown(warnings);
    });

    if (xml) {
      this.displayDiagram(xml);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {props, state} = this;
    const currentXML = props.xml || state.xml;
    const previousXML = prevProps.xml || prevState.xml;

    if (currentXML && currentXML !== previousXML) {
      this.displayDiagram(currentXML);
    }
  }

  componentWillUnmount() {
    this.bpmnViewer.destroy();
  }

  displayDiagram(xml) {
    this.bpmnViewer.importXML(xml);
  }

  handleLoading() {
    const {onLoading} = this.props;

    if (onLoading) {
      onLoading();
    }
  }

  handleError(err) {
    const {onError} = this.props;

    if (onError) {
      onError(err);
    }
  }

  handleShown(warnings) {
    const {onShown} = this.props;

    if (onShown) {
      onShown(warnings);
    }
  }

  render() {
    return <div className={this.props.className} ref={this.containerRef} />;
  }
}

Bpmn.propTypes = {
  onLoading: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onShown: PropTypes.func.isRequired,
  xml: PropTypes.string.isRequired,
};
