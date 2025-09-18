import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const RoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 600px;
  width: 100%;
`;

const ParticipantList = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ParticipantInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ParticipantName = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
`;

const ParticipantScore = styled.span`
  color: #7f8c8d;
  font-size: 14px;
`;

const ScoreDisplay = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
`;

const JoinForm = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  font-weight: 500;
  background: rgba(231, 76, 60, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.2);
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
`;

const InfoText = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 14px;
`;

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);

  const loadParticipants = useCallback(async () => {
    try {
      const response = await axios.get(`http://${window.location.hostname}:3001/api/rooms/${roomId}/participants`);
      if (response.data.success) {
        setParticipants(response.data.participants);
      }
    } catch (err) {
      console.error('참가자 목록 로드 실패:', err);
    }
  }, [roomId]);

  useEffect(() => {
    loadParticipants();
    // 5초마다 참가자 목록 새로고침
    const interval = setInterval(loadParticipants, 5000);
    return () => clearInterval(interval);
  }, [loadParticipants]);

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`http://${window.location.hostname}:3001/api/rooms/${roomId}/participants`, {
        nickname: nickname.trim()
      });

      if (response.data.success) {
        setCurrentParticipant(response.data.participant);
        setJoined(true);
        loadParticipants();
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('참가에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  if (!joined) {
    return (
      <div className="card">
        <h1 className="title">🎯 방 참여</h1>
        <p className="subtitle">닉네임을 입력하여 방에 참여하세요</p>
        
        <RoomContainer>
          <JoinForm>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input"
              maxLength={20}
            />
            
            <button 
              className="btn btn-primary" 
              onClick={joinRoom}
              disabled={loading || !nickname.trim()}
            >
              {loading ? <LoadingSpinner /> : '🚀 참여하기'}
            </button>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </JoinForm>
          
          <button className="btn btn-secondary" onClick={goHome}>
            🏠 홈으로
          </button>
        </RoomContainer>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="title">🎯 방 {roomId}</h1>
      <p className="subtitle">현재 참가자 목록</p>
      
      <RoomContainer>
        <ParticipantList>
          {participants.length === 0 ? (
            <EmptyState>
              아직 참가자가 없습니다
            </EmptyState>
          ) : (
            participants.map((participant) => (
              <ParticipantItem key={participant.id}>
                <ParticipantInfo>
                  <ParticipantName>
                    {participant.nickname}
                    {participant.id === currentParticipant?.id && ' (나)'}
                  </ParticipantName>
                  <ParticipantScore>
                    참여 시간: {new Date(participant.joinedAt).toLocaleTimeString()}
                  </ParticipantScore>
                </ParticipantInfo>
                <ScoreDisplay>{participant.score}점</ScoreDisplay>
              </ParticipantItem>
            ))
          )}
        </ParticipantList>
        
        <InfoText>
          관리자가 점수를 관리합니다
        </InfoText>
        
        <button className="btn btn-secondary" onClick={goHome}>
          🏠 홈으로
        </button>
      </RoomContainer>
    </div>
  );
}

export default Room;
