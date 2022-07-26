import React, { useState, useEffect } from 'react'
import { Row, Col, List, Avatar } from 'antd'
import axios from 'axios';
import moment from 'moment';
import SideVideo from './Sections/SideVideo';
import Subscribe from './Sections/Subscribe';

function VideoDetailPage(props) {
  const [VideoDetail, setVideoDetail] = useState(null);
  const [SubscriberNumber, setSubscriberNumber] = useState(0);

  const videoId = props.match.params.videoId;
  useEffect(() => {
    fetchVideoInfo();
  }, []);

  const fetchVideoInfo = () => {
    axios.get(`/api/videos/${videoId}`)
      .then(response => {
        if(response.status === 200) {
          setVideoDetail(response.data.videoDetail);
          fetchSubscriberNumbers(response.data.videoDetail.writer._id);
        } else {
          alert('비디오 정보를 가져오는데 실패했습니다.');
        }
      });
  };

  const fetchSubscriberNumbers = (writerId) => {
    axios.get(`/api/subscribe/subscriberNumber/${writerId}`)
      .then(response => {
        if(response.status === 200) {
          setSubscriberNumber(response.data.subscriberNumber);
        } else {
          alert('구독자 수를 가져오는데 실패했습니다.');
        }
      });
  };

  const onSubscriberNumber = (newValue) => {
    setSubscriberNumber(newValue);
  };

  if(VideoDetail) {
    const subscribeButton = VideoDetail.writer._id !== localStorage.getItem('userId')
    && <Subscribe userTo={VideoDetail.writer._id} userFrom={localStorage.getItem('userId')}
                subscriberNumber={SubscriberNumber} onSubscriberNumber={onSubscriberNumber}
        />

    return (
      <Row>
        <Col lg={18} xs={24}>
          <div style={{ width: '100%', padding: '3rem 4rem' }}>
            <video style={{ width: '100%' }} src={`http://localhost:5000/${VideoDetail.filePath}`} controls />
            <h1 style={{ fontSize: '18px', paddingTop: '1rem' }}>{VideoDetail.title}</h1>
          <List>
            <List.Item
              actions={[]}
            >
              <List.Item.Meta
                description={VideoDetail.views + ' views • ' + moment(VideoDetail.createdAt).format("MMM DD, YY")}
              />
            </List.Item>

            <List.Item
              actions={[subscribeButton]}
            >
              <List.Item.Meta
                avatar={<Avatar src={VideoDetail.writer.image} />}
                title={VideoDetail.writer.name}
                description={SubscriberNumber + ' subscribers'}
              />
            </List.Item>

          </List>
          </div>
        </Col>

        <Col lg={6} xs={24}>
          <SideVideo />
        </Col>
      </Row>
    )
  } else {
    return (
      <div>...Loading</div>
    )
  }

  
}

export default VideoDetailPage