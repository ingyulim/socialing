import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import QRCode from 'react-qr-code';
import axios from 'axios';

// 현재 프라이빗 IP 감지 함수
const getCurrentIP = () => {
  // 현재 URL에서 hostname 추출
  const hostname = window.location.hostname;
  
  // localhost나 127.0.0.1이 아닌 경우 그대로 사용
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return hostname;
  }
  
  // localhost인 경우 현재 PC의 IP 주소 사용
  return '192.168.45.152';
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  color: #2c3e50;
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #2c3e50;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #bdc3c7;
  background: white;
  color: #2c3e50;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-weight: 600;
`;

const DangerButton = styled(Button)`
  background: #e74c3c;
`;

const Muted = styled.div`
  color: #7f8c8d;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
`;

const RoomCard = styled(Card)`
  border: 1px solid rgba(0,0,0,0.06);
`;

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rooms, setRooms] = useState({});
  const [newRoomId, setNewRoomId] = useState('');
  const [message, setMessage] = useState('');

  const headers = token ? { 'x-admin-token': token } : {};

  const login = async () => {
    setMessage('');
    try {
      const res = await axios.post(`http://${window.location.hostname}:3001/api/admin/login`, { password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        setToken(res.data.token);
        setPassword('');
      }
    } catch (e) {
      setMessage('로그인 실패: 비밀번호를 확인하세요.');
    }
  };

  const changePassword = async () => {
    setMessage('');
    try {
      const res = await axios.post(`http://${window.location.hostname}:3001/api/admin/password`, { newPassword }, { headers });
      if (res.data.success) {
        setMessage('비밀번호가 변경되었습니다.');
        setNewPassword('');
      }
    } catch (e) {
      setMessage('비밀번호 변경 실패.');
    }
  };

  const loadRooms = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`http://${window.location.hostname}:3001/api/admin/rooms`, { headers });
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (e) {
      setMessage('방 목록을 불러오지 못했습니다.');
    }
  }, [token]);

  useEffect(() => {
    loadRooms();
    const i = setInterval(loadRooms, 4000);
    return () => clearInterval(i);
  }, [loadRooms]);

  const createRoom = async () => {
    setMessage('');
    if (!/^\d+$/.test(newRoomId)) {
      setMessage('방 번호는 숫자만 입력하세요.');
      return;
    }
    try {
      const res = await axios.post(`http://${window.location.hostname}:3001/api/admin/rooms`, { roomId: newRoomId }, { headers });
      if (res.data.success) {
        setNewRoomId('');
        loadRooms();
      }
    } catch (e) {
      setMessage(e.response?.data?.message || '방 생성 실패');
    }
  };


  const updateScore = async (participantId, action, value = null) => {
    try {
      let scoreData = { action };
      if (value !== null) {
        scoreData.value = parseInt(value);
      }
      
      const res = await axios.put(`http://${getCurrentIP()}:3001/api/participants/${participantId}/score`, scoreData, { headers });
      if (res.data.success) {
        loadRooms(); // 방 목록 새로고침
      }
    } catch (e) {
      setMessage('점수 업데이트 실패');
    }
  };



  const deleteParticipant = async (participantId, participantName) => {
    const confirmPassword = prompt(`"${participantName}" 참가자를 삭제하시겠습니까?\n\n확인을 위해 관리자 비밀번호를 입력하세요:`);
    
    if (!confirmPassword) {
      return; // 취소
    }
    
    try {
      const res = await axios.delete(`http://${getCurrentIP()}:3001/api/participants/${participantId}`, {
        data: { adminPassword: confirmPassword },
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.data.success) {
        setMessage('참가자가 삭제되었습니다.');
        loadRooms(); // 방 목록 새로고침
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e) {
      setMessage(e.response?.data?.message || '참가자 삭제 실패');
    }
  };


  const deleteRoom = async (roomId) => {
    setMessage('');
    try {
      const res = await axios.delete(`http://${window.location.hostname}:3001/api/admin/rooms/${roomId}`, { headers });
      if (res.data.success) {
        loadRooms();
      }
    } catch (e) {
      setMessage('방 삭제 실패');
    }
  };

  if (!token) {
    return (
      <div className="card">
        <Wrapper>
          <Title>관리자 로그인</Title>
          <Row>
            <Input type="password" placeholder="비밀번호 (초기값 0000)" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={login}>로그인</Button>
          </Row>
          {message && <Muted style={{ color: '#e74c3c' }}>{message}</Muted>}
        </Wrapper>
      </div>
    );
  }

  const entries = Object.entries(rooms);

  return (
    <div className="card">
      <Wrapper>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title style={{ margin: 0 }}>관리자 대시보드</Title>
          <Button onClick={() => window.location.href = '/'}>🏠 홈으로</Button>
        </div>

        <Card>
          <Title>비밀번호 변경</Title>
          <Row>
            <Input type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button onClick={changePassword}>변경</Button>
          </Row>
        </Card>

        <Card>
          <Title>새 방 만들기</Title>
          <Row>
            <Input placeholder="방 번호 (숫자만)" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} />
            <Button onClick={createRoom}>방 만들기</Button>
          </Row>
        </Card>

        <Card>
          <Title>방 목록</Title>
          {entries.length === 0 ? (
            <Muted>아직 생성된 방이 없습니다.</Muted>
          ) : (
            <Grid>
              {entries.map(([roomId, room]) => (
                <RoomCard key={roomId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>방 {roomId}</div>
                      <Muted>참가자 {room.participants.length}명</Muted>
                    </div>
                    <DangerButton onClick={() => deleteRoom(roomId)}>삭제</DangerButton>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                    <QRCode value={`http://${getCurrentIP()}:3000/room/${roomId}`} size={140} />
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#2c3e50' }}>참여자 목록</div>
                    {room.participants.length === 0 ? (
                      <Muted>아직 참여자가 없습니다.</Muted>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {room.participants.map((participant) => (
                          <div key={participant.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontWeight: 500 }}>#{participant.number || 0} {participant.nickname}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Button 
                                style={{ padding: '4px 8px', fontSize: '12px', minWidth: '30px' }}
                                onClick={() => updateScore(participant.id, 'subtract')}
                              >
                                -
                              </Button>
                              <span style={{ 
                                minWidth: '30px', 
                                textAlign: 'center', 
                                fontWeight: 600,
                                color: '#2c3e50'
                              }}>
                                {participant.score || 0}
                              </span>
                              <Button 
                                style={{ padding: '4px 8px', fontSize: '12px', minWidth: '30px' }}
                                onClick={() => updateScore(participant.id, 'add')}
                              >
                                +
                              </Button>
                              <Input
                                type="number"
                                placeholder="직접입력"
                                style={{ 
                                  width: '60px', 
                                  padding: '4px 6px', 
                                  fontSize: '12px',
                                  textAlign: 'center'
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    updateScore(participant.id, 'set', e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <DangerButton 
                                style={{ 
                                  padding: '4px 8px', 
                                  fontSize: '10px', 
                                  minWidth: '40px'
                                }}
                                onClick={() => deleteParticipant(participant.id, participant.nickname)}
                              >
                                삭제
                              </DangerButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </RoomCard>
              ))}
            </Grid>
          )}
        </Card>

        {message && <Muted style={{ color: '#e74c3c' }}>{message}</Muted>}
      </Wrapper>
    </div>
  );
}
