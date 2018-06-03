import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import BubbleChart from '@utils/D3Bubble';
import ProgressCircle from '../../lib/ProgressCircle';
import Styles from './styles';
import StackHeader from '../Header/StackHeader';
import Screen from '../Screen';
import IssueCircleParent from './issueCircleParent';
import MyWeb from '../../lib/WebView';
import Footer from '../Footer';
const {width, height} = Dimensions.get ('window');
class Issues extends Screen {
  constructor (props) {
    super (props);

    this.state = {
      issues: [],
      isLoading: true,
    };
  }

  componentWillMount () {
    this.props.navigation.setParams ({
      hTitle: 'Issues',
      hToggle: 'ListIssues',
      hSettings: 'Settings',
    });

    commonService
      .getIssues (
        this.props.screenProps.pipelineId,
        this.props.screenProps.pipelineTimestamp
      )
      .then (response => {
        //alert('IN'+nextProps.screenProps.pipelineId + ' '+response.length);
        issues = response;
        if (issues.length > 0) {
          this.setState ({
            issues: issues,
            isLoading: false,
          });
        }
      });
  }

  componentWillReceiveProps (nextProps) {
    //console.log('Props from issues=>>>>>>>>',nextProps + ' => '+this.state.issues.length)
    if (
      nextProps.screenProps &&
      nextProps.screenProps.pipelineId &&
      nextProps.screenProps.pipelineTimestamp
    ) {
      console.log ('Issues Mounted');
      console.log (this.props.screenProps);
      this.setState ({
        isLoading: true,
      });
      //        .getIssuesByCategory (nextProps.screenProps.pipelineId)
      commonService
        .getIssues (
          nextProps.screenProps.pipelineId,
          nextProps.screenProps.pipelineTimestamp
        )
        .then (response => {
          //alert('IN'+nextProps.screenProps.pipelineId + ' '+response.length);
          issues = response;
          if (issues.length > 0) {
            issues = issues.filter (function (url) {
              if (url.name && url.name.length > 0) return true;
            });
            this.setState ({
              issues: issues,
              isLoading: false,
            });
          }
        });
    }
  }

  render () {
    const {issues, isLoading} = this.state;
       if (issues.length)
         return (
           <ScrollView>
    	  <IssueCircleParent issues={issues} {...this.props.screenProps}/>
           </ScrollView>
         );
    Uses D3
       if (issues.length)
         return (
           <ScrollView>
             <BubbleChart issues={issues} {...this.props.screenProps} />
           </ScrollView>
         );

    return (
      <View>
        {' '}
        <MyWeb issues={issues} {...this.props.screenProps} />
        <Footer screenProps={this.props.screenProps} {...this.props} />
      </View>
    );
    return <View style={[Styles.container, {height: height - 125}]} />;
  }
}

export default Issues;
