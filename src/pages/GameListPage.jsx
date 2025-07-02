import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import GameList from '../components/GameList';
import { AuthContext } from '../contexts/AuthContext';
import BASE_URL from '../hooks/baseUrl';

const GameListPage = () => {
  const { gameTypeId, productId } = useParams();
  const { apiCall } = useApi();
  const { auth } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Launch game modal state
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const [launchingGameId, setLaunchingGameId] = useState(null);

  useEffect(() => {
    setGames([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(true);
    apiCall(`/game_lists/${gameTypeId}/${productId}?page=1`)
      .then(res => {
        if (res && res.data) {
          setGames(res.data.map(g => ({
            ...g,
            name: g.game_name,
            img: g.image_url,
          })));
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

  // --- GAME LAUNCH HANDLER ---
  const handleLaunchGame = async (game) => {
    setLaunchingGameId(game.id || null);
    setLaunchError("");
    setLaunchLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/seamless/launch-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          game_code: game.game_code,
          product_code: game.product_code,
          game_type: game.game_type,
        }),
      });

      const result = await res.json();

      if (result.code === 200) {
        if (result.url) {
          window.location.href = result.url;
        } else if (result.content) {
          const gameWindow = window.open();
          if (gameWindow) {
            gameWindow.document.write(result.content);
            gameWindow.document.close();
          } else {
            setLaunchError("Popup blocked. Please allow popups.");
          }
        } else {
          setLaunchError(result.message || "Launch failed: No URL or content.");
        }
      } else {
        setLaunchError(result.message || "Failed to launch game.");
      }
    } catch (e) {
      setLaunchError("Network error. Please try again.");
    } finally {
      setLaunchLoading(false);
      setLaunchingGameId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white text-xl">
        Loading games...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-red-400 text-xl">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {launchLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 px-10 py-8 rounded-xl text-white shadow-lg text-2xl font-bold mb-4">
            ဂိမ်းဖွင့်နေသည်... (Launching Game)
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-300"></div>
        </div>
      )}
      {launchError && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 font-bold text-lg">
          {launchError}
        </div>
      )}

      <GameList
        games={games}
        categories={[]}
        showSearch={true}
        onGameLaunch={handleLaunchGame}
      />
      {hasMore && (
        <div className="flex justify-center my-8">
          <button
            className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg shadow hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameListPage;
