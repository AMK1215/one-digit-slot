import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import GameList from '../components/GameList';

const GameListPage = () => {
  const { gameTypeId, productId } = useParams();
  const { apiCall } = useApi();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Reset when params change
    setGames([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(true);
    apiCall(`/game_lists/${gameTypeId}/${productId}?page=1`)
      .then(res => {
        console.log('GameList API response:', res);
        if (res && res.data) {
          setGames(res.data.map(g => ({
            ...g,
            name: g.game_name,
            img: g.image_url,
          })));
          // If less than 20, no more pages
          setHasMore(res.data.length === 20);
        } else {
          setGames([]);
          setHasMore(false);
        }
      })
      .catch(e => {
        setError(e.message);
        setGames([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [gameTypeId, productId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    apiCall(`/game_lists/${gameTypeId}/${productId}?page=${nextPage}`)
      .then(res => {
        if (res && res.data) {
          setGames(prev => [
            ...prev,
            ...res.data.map(g => ({
              ...g,
              name: g.game_name,
              img: g.image_url,
            }))
          ]);
          setHasMore(res.data.length === 20);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white text-xl">Loading games...</div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-red-400 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <GameList games={games} categories={[]} showSearch={true} />
      {hasMore && (
        <div className="flex justify-center my-8">
          <button
            className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg shadow hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameListPage; 