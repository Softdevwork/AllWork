import React, { PureComponent } from 'react';
import {
  Animated,
  FlatList,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import { Text, View, Spinner } from 'native-base';
import SafeView from 'react-native-safe-area-view';
import Posts from './Posts';
import Search from './searchHome';
import { homeApi, cardApi } from '../../components/ApiParams/Home';
import { regionApi } from '../common/data';
import styles from './styles';
import { userCurrentLocation } from '../../components/User/currentLocation';
import calculateBounds from '../../components/Place/calculateBounds';
import { latitudeDelta, longitudeDelta } from '../../utils/constants';
import { LoveApiParam } from '../common/ApiParam';
import { Regionget } from '../common/RegionGet';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);


class HomeFeed extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      info: null,
      refreshing: false,
      serverData: [],
      regionData: [],
      preloadData: [],
      fetching: false,
      loading: true,
      postState: 'allnewsfeed',
      title: 'Top Stories',
    };
    this.page = 1;
    this.scrollY = new Animated.Value(0);
    this.cardDetails = {};
    this.enableClick = false;
    this.noResults = false;
    this.currentRegion = false;
  }

  handleRegionSearch = (value) => {
    regionApi.rname = value;
    this.props.getRegion(regionApi);
  };

  handleSearch = (value = '', locRegion = '') => {
    this.noResults = false;
    this.enableClick = true;
    homeApi.datafor = this.state.postState;
    homeApi.pgnum = 1;
    homeApi.plocation = locRegion.plocation ? parseInt(locRegion.plocation, 0) : 0;
    homeApi.pname = value;
    this.setState({ loading: true, serverData: [], fetching: true });
    this.props.getPost(homeApi);
  };

  handleClick = async (postData) => {
    this.props.navigation.navigate('PostCard', { postData });
  };
  profileCard = (profileData) => {
    console.log(profileData);
    this.props.navigation.navigate('ProfileCard', { profileData });
  };
  loadMore = () => {
    if (!this.onEndReachedCalledDuringMomentum) {
      this.setState({ fetching: true });
      if (this.props.postStore.phase === 'SUCCESS') {
        this.page = this.page + 1;
        homeApi.pgnum = this.page;
        this.props.getPost(homeApi);
      }
      this.onEndReachedCalledDuringMomentum = true;
    }
  }


  addFavourite = (item) => {
    const { serverData } = this.state;
    const index = serverData.findIndex(serverData => serverData.act_id === item.act_id);
    serverData[index].checklovestatus = true;
    this.updateLoveApi(item, 1);
    this.setState({ serverData });
    this.forceUpdate();
  }
  removeFavourite = (item) => {
    const { serverData } = this.state;
    const index = serverData.findIndex(serverData => serverData.act_id === item.act_id);
    serverData[index].checklovestatus = false;
    this.updateLoveApi(item, 0);
    this.setState({ serverData });
    this.forceUpdate();
  }
  updateLoveApi = async (item, status) => {
    const { user } = this.props.userStore;
    const res = await LoveApiParam(item, user, status);
    this.props.lovePost(res);
  }

  renderFooter = () => {
    const { fetching } = this.state;
    if (fetching) {
      return (
        <View style={{ marginBottom: 25 }}>
          <ActivityIndicator
            size="large"
            color="#ed4e1c"
            style={{ marginLeft: 8 }}
          />
        </View>
      );
    }
    return <View />;
  };
  render() {
    const { serverData, loading } = this.state;
    const { currentLocEnable } = this.props.commonStore;
    const Title = ({ index }) => {
      if (index === 0) {
        if (currentLocEnable && this.currentRegion) {
          return (
            <Text style={[styles.screenHeading, { fontSize: 13, fontWeight: '700' }]}>Sorry no posts found in this region. Here are some additional posts.</Text>
          );
        }
        return (<Text style={styles.screenHeading}>{this.state.title}</Text>);
      }
      return null;
    };
    return (
      <SafeView style={styles.containerbackgroundcolor}>
        <View style={styles.containerbackgroundcolor}>
          <Search
            y={this.scrollY}
            navigation={this.props.navigation}
            defaultInputType="Posts"
            defaultPlaceHolder="Find by name, #best"
            screen="HomeScreen"
            search={this.handleSearch}
            regionSearch={this.handleRegionSearch}
            regionData={this.state.regionData}
            handlePosts={this.handlePosts}
            handleCurrentLocation={this.handleCurrentLocation}
            searchText={this.props.commonStore.searchHomeText}
          />
          {!loading ? (
            <AnimatedFlatList
              contentContainerStyle={{
                  // marginHorizontal: 22,
                  marginTop: 19,
                  marginBottom: 0,
                }}
              scrollEventThrottle={16}
              onScroll={Animated.event([
                  { nativeEvent: { contentOffset: { y: this.scrollY } } },
                ])}
              data={serverData}
              renderItem={({ item, index }) => (
                <View key={item.act_id.toString()}>
                  <Title index={index} />
                  {' '}
                  <Posts
                    postCard={this.handleClick}
                    profileCard={this.profileCard}
                    addFavourite={this.addFavourite}
                    removeFavourite={this.removeFavourite}
                    item={item}
                    state={this.state}
                  />
                </View>
                )}
              onEndReached={() => this.loadMore()}
              onEndReachedThreshold={12}
              onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
              keyExtractor={item => item.act_id.toString()}
              ListFooterComponent={this.renderFooter}
              onRefresh={this.onRefresh}
              refreshing={this.state.refreshing}
            />
          ) : (
            <Spinner color="#ed4e1c" style={styles.loader} />
          )}
        </View>
      </SafeView>
    );
  }
}


export default HomeFeed;
