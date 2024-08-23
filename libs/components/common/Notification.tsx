import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_NOTIFICATION, GET_WAIT_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { UPDATE_NOTIFICATION } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { REACT_APP_API_URL } from '../../config';

const NotificationCard = ({ notice, setWaitData }: any) => {
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);
  const [notification, setNotification] = useState<any[]>([]);


  const { loading, data, refetch } = useQuery(GET_NOTIFICATION, {
    fetchPolicy: 'network-only',
    variables: { notificationId: user?._id },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setNotification(data?.getNotification || []);
    },
  });


  const { loading: waitLoading, data: waitData, refetch: refetchWaitCount } = useQuery(GET_WAIT_NOTIFICATION_COUNT, {
    variables: { notificationId: user?._id },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setWaitData(waitData);
    },
  });
    
  // Mutation to update notification status
  const [updateNotification] = useMutation(UPDATE_NOTIFICATION, {
    onCompleted: async () => {
      console.log('Mutation completed successfully');
      await refetch(); // Refetch the query to get updated data
      await refetchWaitCount();
    },
  });

  const handleSubmit = async (id: string) => {
    try {
      await updateNotification({
        variables: {
          input: {
            _id: id,
            notificationStatus: 'READ',
          },
        },
      });
    } catch (err) {
      console.log('Error in handleSubmit:', err);
    }
  };

  if (device === 'mobile') {
    return <div>Notification CARD</div>;
  } else {
    return (
      <div className={`notification-card ${notice ? 'show' : 'hide'}`}>
        <h2>Notifications</h2>
        {notification.length === 0 && <p>No notifications available.</p>}
        {[...notification]
          .sort((a, b) => {
            // Sort by notification status first
            if (a.notificationStatus === 'WAIT' && b.notificationStatus !== 'WAIT') return -1;
            if (a.notificationStatus !== 'WAIT' && b.notificationStatus === 'WAIT') return 1;
            if (a.notificationStatus === 'READ' && b.notificationStatus !== 'READ') return -1;
            if (a.notificationStatus !== 'READ' && b.notificationStatus === 'READ') return 1;
            // If statuses are the same, sort by updatedAt in descending order
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          })
          .map(value => (
            <div
              key={value._id}
              className={`card ${value.notificationStatus === 'READ' ? 'read' : 'unread'}`}
              onClick={() => handleSubmit(value._id)}
            >
              {value.notificationStatus === 'WAIT' && <div className="dot"></div>}
              <p className="title">{value.notificationTitle}</p>
              <div className="info">
                <img src={`${REACT_APP_API_URL}/${value?.memberData?.memberImage}`} alt="" />
                <p>{value.notificationDesc}</p>
              </div>
            </div>
          ))}
      </div>
    );
  }
};

export default NotificationCard;
