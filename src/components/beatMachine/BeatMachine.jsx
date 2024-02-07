import { useEffect, useMemo, useRef, useState } from "react";
import "./BeatMachine.scss";
import { v4 as uuid } from "uuid";

const hitMap = {
  "": "drum-hit",
  "drum-missed": "drum-hit",
  "drum-missed-alt": "drum-hit",
  "drum-hit": "drum-hit-alt",
  "drum-hit-alt": "drum-hit",
};

const missedMap = {
  "": "drum-missed",
  "drum-missed": "drum-missed-alt",
  "drum-missed-alt": "drum-missed",
  "drum-hit": "drum-missed",
  "drum-hit-alt": "drum-missed",
};

const travelTime = 1000;
const fullHeight = 240;
const drumLine = 180;
const startPos = 30;
const unitsPerMilliSec = (drumLine - startPos) / travelTime;

const SCORE = {
  NONE: 0,
  GOOD: 1,
  GREAT: 2,
  PERFECT: 3,
};

const commentColorMap = {
  1: "#f7e540",
  2: "#e80dfc",
  3: "#35fc0d",
};

const commentTextMap = {
  1: "NICE~",
  2: "GREAT!",
  3: "PERFECT!!!",
};

export function BeatMachine(props) {
  const [missed, setMissed] = useState(0);
  const [beats, setBeats] = useState([]);
  const [drumState, setDrumState] = useState("");
  const [currScore, setCurrScore] = useState(SCORE.NONE);
  const [comments, setComments] = useState([]);
  const [beatsInterval, setBeatsInterval] = useState(60000 / props.speed);
  const animateTimer = useRef(null);

  useEffect(() => {
    document.addEventListener("keydown", checkBeat);
    setInterval(produceBeat, beatsInterval);
    window.requestAnimationFrame(moveBeats);

    return () => {
      document.removeEventListener("keydown", checkBeat);
      window.cancelAnimationFrame(moveBeats);
    };
  }, []);

  const produceBeat = () => {
    const res = Math.random();
    if (res > 0.9) {
      multiBeats(2);
    } else if (res > 0.3) {
      singleBeat();
    }
  };

  const multiBeats = (beatNum) => {
    const addBeat = (n) => {
      // current beat
      if (n > 0) {
        singleBeat();
      }

      // next beat
      if (n > 1) {
        setTimeout(() => addBeat(n - 1), beatsInterval / beatNum);
      }
    };
    addBeat(beatNum);
  };

  // count missed beats
  useEffect(() => {
    missed > 0 && props.onMissed();
  }, [missed]);

  // count "good" and "perfect" hits
  useEffect(() => {
    if (drumState === "drum-hit" || drumState === "drum-hit-alt") {
      if (currScore === SCORE.GOOD) {
        props.onGood();
      } else if (currScore === SCORE.PERFECT) {
        props.onPerfect();
      }
    }
  }, [drumState]);

  const removeBeat = (id) => {
    setBeats((oldBeats) => oldBeats.filter((b) => b.id !== id));
  };

  const animateDrum = (missed) => {
    setDrumState((prev) => {
      let newState = prev;
      if (!missed) {
        newState = hitMap[prev];
      } else if (prev !== "drum-hit" && prev !== "drum-hit-alt") {
        newState = missedMap[prev];
      }
      return newState;
    });

    clearTimeout(animateTimer.current);
    animateTimer.current = setTimeout(() => setDrumState(""), 300);
  };

  const checkBeat = (e) => {
    if (e.code !== props.listenOn) return;

    setBeats((beats) => {
      // determine hit result
      let score = SCORE.NONE;

      const newBeats = [...beats];

      for (let b of newBeats) {
        const hit = calculateScore(b);

        // this key press caught a beat
        if (hit !== SCORE.NONE) {
          score = hit;
          b.hit = true;
          setTimeout(() => removeBeat(b.id), 500);
        }
      }

      // display a score comment
      if (score !== SCORE.NONE) {
        setComments((prevComments) => {
          const comment = { id: uuid(), score: score };
          const newComments = prevComments.slice(-5);
          newComments.push(comment);
          return newComments;
        });
      }

      setCurrScore(score);
      animateDrum(score === SCORE.NONE);
      return newBeats;
    });
  };

  const calculateScore = (beat) => {
    if (beat.hit) {
      return SCORE.NONE;
    }

    const diff = Math.abs(beat.pos - drumLine);
    if (diff <= 1) {
      return SCORE.PERFECT;
    } else if (diff <= 5) {
      return SCORE.GREAT;
    } else if (diff <= 10) {
      return SCORE.GOOD;
    }

    return SCORE.NONE;
  };

  const singleBeat = () => {
    // randomly add a beat
    setBeats((oldBeats) => {
      const newBeats = [...oldBeats];
      newBeats.push({
        id: uuid(),
        pos: startPos,
        hit: false,
        created: Date.now(),
      });
      return newBeats;
    });
  };

  const moveBeats = () => {
    setBeats((oldBeats) => {
      const deadLine = fullHeight + 10;
      const missedBeats = oldBeats.filter((b) => b.pos > deadLine);
      setMissed((m) => m + missedBeats.length);

      const currTime = Date.now();
      const newBeats = oldBeats.filter((b) => b.pos < deadLine);
      for (let b of newBeats) {
        b.pos = b.hit
          ? b.pos
          : startPos + unitsPerMilliSec * (currTime - b.created);
        if (calculateScore(b) === SCORE.PERFECT) {
          console.log("LA~");
        }
      }
      return newBeats;
    });

    window.requestAnimationFrame(moveBeats);
  };

  return (
    <div className="beat-machine">
      {comments.map((c) => (
        <h1
          className="comment"
          key={c.id}
          style={{ color: commentColorMap[c.score] }}
        >
          {commentTextMap[c.score]}
        </h1>
      ))}
      <svg className="game-box" viewBox={`0 0 100 ${fullHeight}`}>
        <circle
          className={drumState}
          key={"drum" + props.listenOn}
          cx={50}
          cy={drumLine}
          r={20}
          strokeWidth={2}
          fill="#e00761"
          stroke="black"
        ></circle>
        {beats.map((dot) => (
          <circle
            className={dot.hit ? "beat-shrink beat-node" : "beat-node"}
            key={dot.id}
            cx={50}
            cy={dot.pos}
            r={12}
            fill={props.beatsColor}
            stroke="black"
            strokeWidth={2}
          ></circle>
        ))}
      </svg>
    </div>
  );
}
