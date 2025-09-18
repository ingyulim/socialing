import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 700px;
  width: 100%;
`;

const InfoText = styled.div`
  text-align: center;
  color: #34495e;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const RoomGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`;

const RoomCard = styled.a`
  display: block;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  color: #2c3e50;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0,0,0,0.12);
  }
`;

const RoomTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #2c3e50;
`;

const RoomMeta = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;

const AdminLink = styled.a`
  color: #2c3e50;
  text-decoration: none;
  font-size: 14px;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  padding: 10px 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  
  &:hover {
    color: #1f2a35;
    background: rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  }
`;

function Home() {
  const API_BASE = `http://${window.location.hostname}:3001`;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
      } else {
        setError('방 목록을 불러오지 못했습니다.');
      }
    } catch (e) {
      setError('방 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h1 className="title">🎯 소셜링</h1>
      <p className="subtitle">QR 코드를 스캔하여 방에 참여하세요!</p>
      
      <HomeContainer>
        <InfoText>
          아래에서 공개된 방을 선택해 참여할 수 있어요.
        </InfoText>
        {loading ? (
          <div style={{ color: '#7f8c8d' }}>불러오는 중...</div>
        ) : error ? (
          <div style={{ color: '#e74c3c' }}>{error}</div>
        ) : rooms.length === 0 ? (
          <div style={{ color: '#7f8c8d' }}>현재 생성된 방이 없습니다.</div>
        ) : (
          <RoomGrid>
            {rooms.map((r) => (
              <RoomCard key={r.id} href={`/room/${r.id}`}>
                <RoomTitle>방 {r.id}</RoomTitle>
                <RoomMeta>참가자 {r.participantsCount}명</RoomMeta>
              </RoomCard>
            ))}
          </RoomGrid>
        )}

        <AdminLink href="/admin">👑 관리자 페이지</AdminLink>
      </HomeContainer>
    </div>
  );
}

export default Home;
