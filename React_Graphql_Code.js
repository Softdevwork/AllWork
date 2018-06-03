import React, { Component } from 'react';
import { fromGlobalId, cleanTopicTitle, cleanCreationDate } from '../utils';
import { graphql, compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';

class Issues extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            pipeline_id: ''
	}
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pipeline_id && nextProps.pipeline_id != this.state.pipeline_id) {
            this.setState({ loaded: false, pipeline_id: nextProps.pipeline_id });
        }
        if (!nextProps.issues_data.loading && !this.state.loaded && nextProps.issues_data.query.find) {
            this.setState({ loaded: true});
            const id = nextProps.issues_data.query.find.issues[0].issue.id;
            this.props.onChange(id)
        }
    }

    render() {
        if (this.props.issues_data.loading || !this.props.issues_data.query.find) {
            return (<div></div>)
        }
        const issues = this.props.issues_data.query.find.issues;

        return (
            <div className="issues">
                <div className="hding">
                    <span className="f_left">ISSUES</span>
                    <span className="f_right"><i className="fa fa-refresh" aria-hidden="true"></i></span>
                    <div className="div_clr"> </div>
		    {issues.map(({ issue}, key) => (
		        <div className="div_l" key={key}>
			    <span className="div_1 d_inner"><span>{key+1}</span></span>

			    <span className="div_2 d_inner">
			        <span onClick={this.props.onChange.bind(this, issue.id)}>{cleanTopicTitle(issue.name)}</span>
                            </span>

                            <span className="div_3 d_inner">
                                <span><i className="fa fa-circle" aria-hidden="true"></i></span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );

    }
}
export default graphql(gql`
    query Issues ($filter: JSON!) {
       query: Topic {
           find: TopicFind (filter: $filter) {
    	       issues: edges {
	        issue:node {
                    id
                    name
                    title
                    timestamp
	        }
    	       }
          }
       }
    }
    `, {
        options: (props) => ({
            errorPolicy: 'all',
            variables: { "filter": { where: { pipeline_id: props.pipeline_id, timestamp: props.timestamp } } }
        }),
        name: "issues_data",
    })(Issues);
