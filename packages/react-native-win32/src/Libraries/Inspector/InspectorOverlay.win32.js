/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

// const Dimensions = require('../Utilities/Dimensions'); [Win32]
const ElementBox = require('./ElementBox');
const React = require('react');
const StyleSheet = require('../StyleSheet/StyleSheet');
const ReactNative = require('../Renderer/shims/ReactNative');
const UIManager = require('../ReactNative/UIManager');
const View = require('../Components/View/View');

import type {HostComponent} from '../Renderer/shims/ReactNativeTypes';
import type {ViewStyleProp} from '../StyleSheet/StyleSheet';
import type {PressEvent} from '../Types/CoreEventTypes';

type Inspected = $ReadOnly<{|
  frame?: Object,
  style?: ViewStyleProp,
|}>;

type Props = $ReadOnly<{|
  isFabric: boolean,
  inspected?: Inspected,
  inspectedView?: ?React.ElementRef<HostComponent<mixed>>,
  onTouchViewTag: (tag: number, frame: Object, pointerY: number) => mixed,
|}>;

class InspectorOverlay extends React.Component<Props> {
  findViewForTouchEvent: (e: PressEvent) => void = (e: PressEvent) => {
    const {locationX, locationY} = e.nativeEvent.touches[0];
    UIManager.findSubviewIn(
      ReactNative.findNodeHandle(this.props.inspectedView),
      [locationX, locationY],
      (nativeViewTag, left, top, width, height) => {
        this.props.onTouchViewTag(
          nativeViewTag,
          {left, top, width, height},
          locationY,
        );
      },
    );
  };

  shouldSetResponser: (e: PressEvent) => boolean = (e: PressEvent): boolean => {
    this.findViewForTouchEvent(e);
    return true;
  };

  render(): React.Node {
    let content = null;
    if (this.props.inspected) {
      content = (
        <ElementBox
          frame={this.props.inspected.frame}
          style={this.props.inspected.style}
        />
      );
    }

    // [Win32, height replaced with 100% to avoid Dimensions call]
    return (
      <View
        onStartShouldSetResponder={this.shouldSetResponser}
        onResponderMove={this.findViewForTouchEvent}
        style={[styles.inspector, {height: '100%'}]}>
        {content}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inspector: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
  },
});

module.exports = InspectorOverlay;
