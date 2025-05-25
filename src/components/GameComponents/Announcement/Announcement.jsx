import React, { useEffect, useState } from 'react';
import './Announcement.css';

function Announcement({ link, duration = 3000, onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, duration + 500);

    return () => clearTimeout(timeout);
  }, [link]);

  if (!visible) return null;

  return (
    <div className="announcement">
      <img src={link} alt="" />
    </div>
  );
}

export default Announcement;
