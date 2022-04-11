import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  PaymentBtn: {
    backgroundColor: '#307ECC',
    fontSize: 12,
    color: 'white',
    borderRadius: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40
  },

  calloutContainer: {
    width: 160,
    height: "100%",
    backgroundColor: '#307ECC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    justifyContent: "center",
  },

  calloutText: {
    fontSize: 14,
    alignSelf: 'center'
  },

  calloutSmallText: {
    color: "#005555",
    fontSize: 10,
  },

  searchStoreContainer: {
    flexDirection: 'row',
    backgroundColor: '#307ECC',
    height: 56,
    elevation: 3,
  },

  searchStoreInput: {
    alignSelf: "center",
    marginLeft: 56,
    height: 40,
    backgroundColor: "transparent",
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
  },

  searchStoreText: {
    fontSize: 16,
    color: 'white',
    width: 200,
  },

  searchUserButton: {
    width: 42,
    height: 42,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    backgroundColor: '#EEE',
    height: '100%',
    borderRadius: 20
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
  },

  itemImage: {
    borderRadius: 100,
    width: 70,
    height: 70,
  },

  separator: {
    height: 1,
    width: "95%",
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: "#C8C8C8",
  },

  footer: {
    position: "absolute",
    bottom: 32,
    backgroundColor: "#307ECC",
    borderRadius: 20,
    elevation: 3,
    padding: 10,
    right: 10,
    zIndex: 3
  },

  storeLinkText: {
    alignSelf: 'center',
    textDecorationLine: 'underline',
    color: '#0645AD'
  },

  headerBtn: {
    width: '50%',
    backgroundColor: '#4286c9',
    height: 30,
    borderColor: 'white',
    elevation: 3,
    justifyContent: 'center',
  },

  headerBtnLeft: {
    borderRightWidth: 2
  },

  headerBtnRight: {
    borderLeftWidth: 2
  },


  headerBtnText: {
    color: 'white',
    textAlign: 'center',
  },

  textInputIcon: {
    textAlignVertical: 'center',
    marginLeft: 6,
  },

  passwordInput: {
    marginBottom: 10,
    flexDirection: 'row'
  },

  settingsFooter: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center'
  },

  footerRigthMenu: {
    flexDirection: 'row',
    width: '30%',
    justifyContent: 'space-between'
  },

  inputContainer: {
    marginBottom: 12,
    width: '80%',
    alignSelf: 'center'
  },

  passwordContainer: {
    borderWidth: 2,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 2
  }
});