import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  Text,
  View,
  Dimensions,
  Image
} from 'react-native';

const {
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

const IS_IPHONE_X = SCREEN_HEIGHT === 812;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 44 : 20) : 0;
const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 88 : 64) : 45;

const SCROLL_EVENT_THROTTLE = 16;
const DEFAULT_HEADER_MAX_HEIGHT = 200;
const DEFAULT_HEADER_MIN_HEIGHT = NAV_BAR_HEIGHT;
const DEFAULT_EXTRA_SCROLL_HEIGHT = 50;
const DEFAULT_BACKGROUND_IMAGE_SCALE = 1.5;

const DEFAULT_NAVBAR_COLOR = '#3498db';
const DEFAULT_BACKGROUND_COLOR = '#303F9F';
const DEFAULT_TITLE_COLOR = 'white';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DEFAULT_NAVBAR_COLOR,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: DEFAULT_HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
  },
  bar: {
    backgroundColor: 'transparent',
    height: DEFAULT_HEADER_MIN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerTitle: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: DEFAULT_TITLE_COLOR,
    textAlign: 'center',
    fontSize: 16,
  },
});

class RNParallax extends Component {
  constructor() {
    super();
    this.state = {
        scrollY: new Animated.Value(0),
        offsetTop: 0
    };
    this.scrollLower = this.scrollLower.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs._scrollView._component.scrollTo({x: 0, y: -20, animated: false});
    }, 100);
  }

  getHeaderMaxHeight() {
    const { headerMaxHeight } = this.props;
    return headerMaxHeight;
  }

  getHeaderMinHeight() {
    const { headerMinHeight } = this.props;
    return headerMinHeight;
  }

  getHeaderScrollDistance() {
    return (this.props.hasImage ? this.getHeaderMaxHeight() : this.getHeaderMinHeight()) - this.getHeaderMinHeight();
  }

  getExtraScrollHeight() {
    const { extraScrollHeight } = this.props;
    return extraScrollHeight;
  }

  getBackgroundImageScale() {
    const { backgroundImageScale } = this.props;
    return backgroundImageScale;
  }

  getInputRange() {
    return [-this.getExtraScrollHeight(), 0,  this.getHeaderScrollDistance()];
  }

  getHeaderHeight() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [this.props.hasImage ? this.getHeaderMaxHeight() : this.getHeaderMinHeight() + this.getExtraScrollHeight(), this.props.hasImage ? this.getHeaderMaxHeight() : this.getHeaderMinHeight(), this.getHeaderMinHeight()],
      extrapolate: 'clamp',
    });
  }

  getNavBarOpacity() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [0, 1, 1],
      extrapolate: 'clamp',
    });
  }

  getImageOpacity() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });
  }

  getImageTranslate() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [0, 0, -50],
      extrapolate: 'clamp',
    });
  }

  getImageScale() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [this.getBackgroundImageScale(), 1, 1],
      extrapolate: 'clamp'
    });
  }

  getTitleTranslate() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [5, 0, 0],
      extrapolate: 'clamp',
    });
  }

  scrollLower() {
      setTimeout(() => {
        this.refs._scrollView._component.scrollTo({x: 0, y: this.state.offsetTop + 100, animated: true});
      }, 100);

  }

  scrollHigher() {
    setTimeout(() => {
      this.refs._scrollView._component.scrollTo({ x: 0, y: this.state.offsetTop - 1, animated: true });
    }, 300);
  }

  renderHeaderTitle() {
    const { title, titleStyle } = this.props;
    const titleTranslate = this.getTitleTranslate();

    return (
      <Animated.View
        style={[
          styles.headerTitle,
          {
            transform: [
              { translateY: titleTranslate },
            ],
            height: this.getHeaderHeight(),
          },
        ]}
      >
          {title}
      </Animated.View>
    );
  }

  renderHeaderForeground() {
    const { renderNavBar } = this.props;

    return (
      <Animated.View
        style={[
          styles.bar,
          {
            height: this.getHeaderMinHeight(),
          }
        ]}
      >
        {renderNavBar()}
      </Animated.View>
    );
  }

  renderBackgroundImage() {
    const { backgroundImage } = this.props;
    const imageOpacity = this.getImageOpacity();
    const imageTranslate = this.getImageTranslate();
    const imageScale = this.getImageScale();

    return (
        <View>
            <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={['#000000FF', '#ffffff11']}
                    style={{ width: '100%', height: 100, position: 'absolute', zIndex: 1 }}
            />
            <Animated.Image
                style={[
                styles.backgroundImage,
                {
                    height: this.props.hasImage ? this.getHeaderMaxHeight() : this.getHeaderMinHeight(),
                    opacity: imageOpacity,
                    transform: [{ translateY: imageTranslate }, { scale: imageScale }],
                },
                ]}
                source={this.props.backgroundImageWithUri ? {uri: backgroundImage} : null}
            />
        </View>
    );
  }

  renderPlainBackground() {
    const { backgroundColor } = this.props;

    const imageOpacity = this.getImageOpacity();
    const imageTranslate = this.getImageTranslate();
    const imageScale = this.getImageScale();

    return (
      <Animated.View
        style={{
          height: this.props.hasImage ? this.getHeaderMaxHeight() : this.getHeaderMinHeight(),
          backgroundColor,
          opacity: imageOpacity,
          transform: [{ translateY: imageTranslate }, { scale: imageScale }],
        }}
      />
    );
  }

  renderNavbarBackground() {
    const { navbarColor } = this.props;
    const navBarOpacity = this.props.hasImage ? this.getNavBarOpacity() : 1;

    return (
        <Animated.Image
            style={[
            styles.header,
            {
                height: this.getHeaderHeight(),
                backgroundColor: navbarColor,
                opacity: navBarOpacity,
                width: '100%'
            },
            ]}
            source={require('../../src/assets/img/linear-gradient-news.png')}
        />
    );
  }

  renderHeaderBackground() {
    const { backgroundImage, backgroundColor, hasImage } = this.props;
    const imageOpacity = this.getImageOpacity();

    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: this.getHeaderHeight(),
            opacity: imageOpacity,
            backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
          },
        ]}
      >
        {backgroundImage && this.renderBackgroundImage()}
        {!backgroundImage && this.renderPlainBackground()}
      </Animated.View>
    );
  }

  renderScrollView() {
    const { renderContent, scrollEventThrottle } = this.props;

    return (
        <Animated.ScrollView
            style={[styles.scrollView]}
            scrollEventThrottle={scrollEventThrottle}
            ref={'_scrollView'}
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                {
                    listener: event => {
                        this.setState({ offsetTop: event.nativeEvent.contentOffset.y })
                    },
                },
            )}
        >
            <View style={{ marginTop: this.props.hasImage ? this.getHeaderMaxHeight() : this.getHeaderMinHeight() }}>
                <View style={{marginTop: Platform.OS === "android" ? 0: -20}}>
                {renderContent()}
                </View>
            </View>

        </Animated.ScrollView>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderScrollView()}
        {this.renderNavbarBackground()}
        {this.props.hasImage && this.renderHeaderBackground()}
        {this.renderHeaderForeground()}
      </View>
    );
  }
}

RNParallax.propTypes = {
  renderNavBar: PropTypes.func,
  renderContent: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.string,
  navbarColor: PropTypes.string,
  title: PropTypes.func,
  titleStyle: PropTypes.number,
  headerMaxHeight: PropTypes.number,
  headerMinHeight: PropTypes.number,
  scrollEventThrottle: PropTypes.number,
  extraScrollHeight: PropTypes.number,
  backgroundImageScale: PropTypes.number,
  backgroundImageWithUri: PropTypes.bool,
  hasImage: PropTypes.bool
};

RNParallax.defaultProps = {
  renderNavBar: () => <View />,
  navbarColor: DEFAULT_NAVBAR_COLOR,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  backgroundImage: null,
  title: () => <View />,
  titleStyle: styles.headerText,
  headerMaxHeight: DEFAULT_HEADER_MAX_HEIGHT,
  headerMinHeight: DEFAULT_HEADER_MIN_HEIGHT,
  scrollEventThrottle: SCROLL_EVENT_THROTTLE,
  extraScrollHeight: DEFAULT_EXTRA_SCROLL_HEIGHT,
  backgroundImageScale: DEFAULT_BACKGROUND_IMAGE_SCALE,
  backgroundImageWithUri: true,
  hasImage: false
};

export default RNParallax;
