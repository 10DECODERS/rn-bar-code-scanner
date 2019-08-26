import React, {Component, Fragment} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';

const RADIO_PROPS = [
  {label: 'QR Code', value: 0, width: 250, height: 230},
  {label: 'Bar Code', value: 1, width: 280, height: 220},
];

const FLASH_VALUES = [
  {type: 'off', icon: require('./src/assets/img/off.png')},
  {type: 'torch', icon: require('./src/assets/img/torch.png')},
];

const BACK = require('./src/assets/img/back.png');

export default class BarcodeScan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openScanner: false,
      torchOn: 0,
      value: 0,
      openModal: false,
      scannedData: null,
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress = () => {
    const {openScanner, openModal} = this.state;
    if (openModal) {
      this.setState({openModal: false});
    } else if (openScanner) {
      this.setState({openScanner: false});
    } else {
      BackHandler.exitApp();
    }
    return true;
  };

  onBarCodeRead = e => {
    const data = e.data || e.barcodes[0].rawData;
    if (data) {
      this.setState({openModal: true, scannedData: data, torchOn: 0});
    }
  };

  onFlashChange = () => {
    const {torchOn} = this.state;
    if (torchOn === 1) {
      this.setState({torchOn: 0});
    } else {
      this.setState({torchOn: torchOn + 1});
    }
  };

  scannerBtn = () => {
    const {openScanner} = this.state;
    this.setState({openScanner: !openScanner});
  };

  renderHomeScreen = () => {
    const {value} = this.state;
    return (
      <View style={styles.btnView}>
        <Text style={styles.headerTxt}>Select the Scanner Type</Text>
        <RadioForm
          radio_props={RADIO_PROPS}
          initial={value}
          // formHorizontal={true}
          animation={true}
          buttonSize={12}
          onPress={value => {
            this.setState({value});
          }}
        />
        <TouchableOpacity
          style={styles.openScanner}
          onPress={() => this.scannerBtn()}>
          <Text style={styles.scannerBtn}>Open Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderScanner = () => {
    const {value, torchOn, openModal} = this.state;
    return (
      !openModal && (
        <RNCamera
          style={styles.preview}
          flashMode={FLASH_VALUES[torchOn].type}
          onBarCodeRead={e => this.onBarCodeRead(e)}
          onGoogleVisionBarcodesDetected={e => this.onBarCodeRead(e)}
          ref={cam => (this.camera = cam)}>
          <BarcodeMask
            width={RADIO_PROPS[value].width}
            height={RADIO_PROPS[value].height}
            edgeBorderWidth={2}
            edgeColor={'#fff'}
            showAnimatedLine={true}
            lineAnimationDuration={10000}
            transparency={0.5}
            animatedLineColor={'#a2d7dd'}
            animatedLineHeight={0.5}
            backgroundColor={'rgba(0, 0, 0, 0.5)'}
          />
          <Text style={styles.scannerTxt}>
            Adjust the frame to fit the bar code
          </Text>
        </RNCamera>
      )
    );
  };

  renderFlashIcon = () => {
    const {torchOn} = this.state;
    return (
      <View style={styles.bottomOverlay}>
        <TouchableOpacity onPress={() => this.handleBackPress()}>
          <Image style={styles.cameraIcon} source={BACK} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.onFlashChange()}>
          <Image
            style={styles.cameraIcon}
            source={FLASH_VALUES[torchOn].icon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderModal = () => {
    const {scannedData} = this.state;

    return (
      <View style={styles.modal}>
        <ScrollView style={styles.modalScroll}>
          <Text style={[styles.headerTxt, {color: '#fff'}]}>
            Scanning Result
          </Text>
          <View style={styles.hrLine} />
          <Text style={styles.scannerTxt}>{scannedData}</Text>
        </ScrollView>
        <TouchableOpacity
          onPress={() => this.setState({openModal: false})}
          style={styles.closeBtn}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    console.disableYellowBox = true;
    const {openScanner, openModal} = this.state;
    return (
      <Fragment>
        <View style={styles.container}>
          <StatusBar
            barStyle='default'
            hidden={false}
            backgroundColor="#772ea2"
            // translucent={false}
            networkActivityIndicatorVisible={true}
          />
          {!openScanner && this.renderHomeScreen()}
          {openScanner && this.renderScanner()}
          {openScanner && this.renderFlashIcon()}
          {openModal && this.renderModal()}
        </View>
      </Fragment>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    // flexDirection: 'row'
  },
  btnView: {
    height: '40%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTxt: {
    fontSize: 22,
    fontWeight: '300',
  },
  preview: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraIcon: {
    margin: 5,
    height: 40,
    width: 40,
  },
  bottomOverlay: {
    position: 'absolute',
    width: '100%',
    top: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  openScanner: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 7,
  },
  scannerTxt: {
    color: '#fff',
    fontSize: 16,
    marginBottom: '40%',
  },
  scannerBtn: {
    color: '#fff',
    fontSize: 16,
  },
  modal: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 100,
    backgroundColor: '#000',
    // opacity: 0.7,
  },
  modalScroll: {
    height: '90%',
    paddingHorizontal: 10,
  },
  hrLine: {
    width: '100%',
    marginVertical: 5,
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
