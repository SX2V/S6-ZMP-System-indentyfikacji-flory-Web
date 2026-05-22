import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const FriendsPage = () => {
    const [tab, setTab] = useState<'friends' | 'requests'>('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        api.get('/friends').then(res => setFriends(res.data));
        api.get('/friends/requests').then(res => setRequests(res.data));
    }, []);

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                <h1>Znajomi</h1>
                <div style={{ background: 'var(--dew)', padding: 4, borderRadius: 8 }}>
                    <button onClick={() => setTab('friends')} className={tab === 'friends' ? 'btn-primary' : 'btn-outline'} style={{ border: 'none' }}>Moi znajomi</button>
                    <button onClick={() => setTab('requests')} className={tab === 'requests' ? 'btn-primary' : 'btn-outline'} style={{ border: 'none' }}>Zaproszenia</button>
                </div>
            </div>

            <div className="fade-up">
                {(tab === 'friends' ? friends : requests).map((f: any) => (
                    <div key={f.friendshipId} className="card" style={{ display: 'flex', alignItems: 'center', padding: 15, marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sage)', marginRight: 15 }}></div>
                        <div style={{ flex: 1 }}><b>{f.username}</b></div>
                        {tab === 'requests' && <button className="btn-primary" style={{ fontSize: 12 }}>Akceptuj</button>}
                        <button className="btn-outline" style={{ fontSize: 12, marginLeft: 8 }}>Profil</button>
                    </div>
                ))}
            </div>
        </div>
    );
};