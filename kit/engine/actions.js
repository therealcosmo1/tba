import { PLAYER } from './world.js';
import { describeRoom, describeContents, describeOverlook } from './describe.js';

// Default behaviour for each action. Content overrides any of these through
// room.before[action], obj.on[action] or obj.onTarget[action] (see step.js).
// `verb` is what the parser calls the action when it asks for a missing noun.
// `meta` actions don't use up a turn.

function cannotTake(w, id) {
  const o = w.obj(id);
  if (id === PLAYER) return w.msg('takeSelf');
  if (typeof o.fixed === 'string' || typeof o.fixed === 'function') return w.text(o.fixed);
  if (o.animate) return w.msg('takePerson', { thing: w.the(id) });
  if (o.fixed || o.scenery || o.kind === 'room') return w.msg('cantTake');
  return null;
}

function implicitTake(w, id) {
  if (w.held(id)) return true;
  const reason = cannotTake(w, id);
  if (reason) {
    w.say(reason);
    return false;
  }
  w.say(w.msg('firstTaking', { thing: w.the(id) }), 'implicit');
  w.move(id, PLAYER);
  return true;
}

// Move the player along an exit. spec: "roomId" | { to, msg, door }.
// A door shared by two rooms says where it leads from each: leadsTo: { hall: 'balcony', balcony: 'hall' }.
export function travel(w, spec) {
  if (typeof spec === 'string') spec = { to: spec };
  if (spec.door) {
    const door = spec.door;
    const d = w.obj(door);
    spec = { ...d.enter, to: d.leadsTo?.[w.room] ?? d.enter?.to, ...spec };
    // The wrong side of a one-way passage: refuse before trying to open it.
    if (d.leadsTo && !spec.to) {
      w.say(w.text(spec.msg) ?? w.msg('cantGo'));
      return;
    }
    if (d.openable && !w.is(door, 'open')) {
      if (w.is(door, 'locked')) {
        w.say(w.msg('locked', { thing: w.the(door) }));
        return;
      }
      w.say(w.msg('firstOpening', { thing: w.the(door) }), 'implicit');
      w.set(door, 'open');
    }
  }
  if (!spec.to) {
    w.say(w.text(spec.msg) ?? w.msg('cantGo'));
    return;
  }
  const from = w.room;
  w.move(PLAYER, spec.to);
  if (!w.state.visited.includes(spec.to)) w.state.visited.push(spec.to);
  const followers = (w.state.followers ?? []).filter((a) => w.parent(a) === from);
  for (const a of followers) w.move(a, spec.to);
  const dest = w.obj(spec.to);
  const doorOnMap = spec.door && dest.map?.shapes.some((s) => s.obj === spec.door);
  w.state.near = doorOnMap ? spec.door : dest.entryNear ?? null;
  describeRoom(w);
  // An actor's own follow text (which can be {once}...{/once}) replaces the usual line.
  for (const a of followers) w.say(w.obj(a).followText !== undefined ? w.text(w.obj(a).followText) : w.msg('follows', { person: w.the(a) }));
}

// The direction a door or passage leads from the current room ('u', 'd', 'n'...), if any.
function wayFromHere(w, id) {
  return Object.entries(w.obj(w.room).exits ?? {}).find(([, e]) => e.door === id)?.[0];
}

export const ACTIONS = {
  look: { verb: 'look', run: (w) => describeRoom(w) },

  examine: {
    verb: 'examine',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (o.kind === 'room') return dobj === w.room ? describeRoom(w) : describeOverlook(w, dobj, true);
      w.say(o.desc ? w.text(o.desc) : w.msg('examineNothing', { thing: w.the(dobj) }));
      if (o.openable) w.say(w.msg(w.is(dobj, 'open') ? 'isOpen' : 'isClosed', { thing: w.the(dobj) }));
      if (o.switchable) {
        const on = w.is(dobj, 'on');
        w.say(w.text(on ? o.onText : o.offText) || w.msg(on ? 'isOn' : 'isOff', { thing: w.the(dobj) }));
      }
      if (w.is(dobj, 'worn')) w.say(w.msg('wearingIt'));
      describeContents(w, dobj);
    },
  },

  search: {
    verb: 'search',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (!o.supporter && !o.container) return w.say(w.msg('searchNothing'));
      if (!w.canSeeInside(dobj)) return w.say(w.msg('isClosed', { thing: w.the(dobj) }));
      if (!describeContents(w, dobj)) w.say(w.msg('searchEmpty', { prep: o.supporter ? 'on' : 'in', thing: w.the(dobj) }));
    },
  },

  take: {
    verb: 'take',
    run(w, { dobj, iobj }) {
      if (w.held(dobj)) return w.say(w.msg('alreadyHave'));
      if (iobj && w.parent(dobj) !== iobj) {
        return w.say(w.msg('notThere', { thing: w.the(dobj), prep: w.obj(iobj).supporter ? 'on' : 'in', other: w.the(iobj) }));
      }
      const reason = cannotTake(w, dobj);
      if (reason) return w.say(reason);
      w.move(dobj, PLAYER);
      w.say(w.msg('taken', { thing: w.the(dobj) }));
    },
  },

  drop: {
    verb: 'drop',
    run(w, { dobj }) {
      if (!w.carried(dobj)) return w.say(w.msg('notCarrying'));
      if (w.is(dobj, 'worn')) {
        w.say(w.msg('firstTakingOff', { thing: w.the(dobj) }), 'implicit');
        w.set(dobj, 'worn', false);
      }
      w.move(dobj, w.room);
      w.say(w.msg('dropped', { thing: w.the(dobj) }));
    },
  },

  putOn: {
    verb: 'put',
    run(w, { dobj, iobj }) {
      if (dobj === iobj) return w.say(w.msg('putOnSelf'));
      if (!w.obj(iobj).supporter) return w.say(w.msg('cantPutOn', { thing: w.the(iobj) }));
      if (!implicitTake(w, dobj)) return;
      w.set(dobj, 'worn', false);
      w.move(dobj, iobj);
      w.say(w.msg('putOn', { thing: w.the(dobj), other: w.the(iobj) }));
    },
  },

  putIn: {
    verb: 'put',
    run(w, { dobj, iobj }) {
      if (dobj === iobj) return w.say(w.msg('putInSelf'));
      if (!w.obj(iobj).container) return w.say(w.msg('cantPutIn', { thing: w.the(iobj) }));
      if (!w.canSeeInside(iobj)) return w.say(w.msg('isClosed', { thing: w.the(iobj) }));
      if (!implicitTake(w, dobj)) return;
      w.set(dobj, 'worn', false);
      w.move(dobj, iobj);
      w.say(w.msg('putIn', { thing: w.the(dobj), other: w.the(iobj) }));
    },
  },

  inventory: {
    verb: 'inventory',
    meta: true,
    run(w) {
      const items = w.children(PLAYER);
      if (!items.length) return w.say(w.msg('emptyHanded'));
      const tag = (id) => (w.is(id, 'worn') ? ` ${w.msg('wornTag')}` : '')
        + (w.obj(id).switchable && w.is(id, 'on') ? ` ${w.msg(w.obj(id).light ? 'litTag' : 'onTag')}` : '');
      const lines = items.map((id) => `  ${w.a(id)}${tag(id)}`);
      w.say([w.msg('carrying'), ...lines].join('\n'), 'list');
    },
  },

  go: {
    verb: 'go',
    run(w, { dir }) {
      const room = w.obj(w.room);
      const exit = room.exits?.[dir];
      if (!exit || (exit.door && w.is(exit.door, 'hidden'))) return w.say(w.text(room.noExit) ?? w.msg('cantGo'));
      travel(w, exit);
    },
  },

  approach: {
    verb: 'go to',
    run(w, { dobj }) {
      if (w.carried(dobj)) return w.say(w.msg('alreadyHolding'));
      if (dobj === PLAYER || w.obj(dobj).kind === 'room') return w.say(w.msg('alreadyHere'));
      w.say(w.msg('approach', { thing: w.the(dobj) }));
    },
  },

  enter: {
    verb: 'enter',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (o.leadsTo || o.openable) return travel(w, { door: dobj });
      if (!o.enter) return w.say(w.msg('cantEnter'));
      travel(w, o.enter);
    },
  },

  open: {
    verb: 'open',
    run(w, { dobj }) {
      if (!w.obj(dobj).openable) return w.say(w.msg('cantOpen'));
      if (w.is(dobj, 'open')) return w.say(w.msg('alreadyOpen'));
      if (w.is(dobj, 'locked')) return w.say(w.msg('locked', { thing: w.the(dobj) }));
      w.set(dobj, 'open');
      w.say(w.msg('opened', { thing: w.the(dobj) }));
      describeContents(w, dobj);
    },
  },

  close: {
    verb: 'close',
    run(w, { dobj }) {
      if (!w.obj(dobj).openable) return w.say(w.msg('cantClose'));
      if (!w.is(dobj, 'open')) return w.say(w.msg('alreadyClosed'));
      w.set(dobj, 'open', false);
      w.say(w.msg('closed', { thing: w.the(dobj) }));
    },
  },

  unlock: {
    verb: 'unlock',
    run(w, { dobj, iobj }) {
      const o = w.obj(dobj);
      if (!o.openable || !('key' in o || w.is(dobj, 'locked'))) return w.say(w.msg('noLock'));
      if (!w.is(dobj, 'locked')) return w.say(w.msg('notLocked'));
      if (!iobj) return w.say(w.msg('unlockWith', { thing: w.the(dobj) }));
      if (o.key !== iobj) return w.say(w.msg('wrongKey', { thing: w.the(iobj) }));
      w.set(dobj, 'locked', false);
      w.say(w.msg('unlocked', { thing: w.the(dobj) }));
    },
  },

  eat: {
    verb: 'eat',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (!o.edible) return w.say(w.msg('cantEat'));
      if (!implicitTake(w, dobj)) return;
      w.remove(dobj);
      w.say(w.text(o.eaten) ?? w.msg('eaten', { thing: w.the(dobj) }));
    },
  },

  drink: {
    verb: 'drink',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (!o.drinkable) return w.say(w.msg('cantDrink'));
      if (!implicitTake(w, dobj)) return;
      if (o.becomes) w.move(o.becomes, w.parent(dobj));
      w.remove(dobj);
      w.say(w.text(o.drunk) ?? w.msg('drunk', { thing: w.the(dobj) }));
    },
  },

  read: {
    verb: 'read',
    run(w, cmd) {
      const o = w.obj(cmd.dobj);
      if (!o.text) return ACTIONS.examine.run(w, cmd);
      w.say(w.text(o.text));
    },
  },

  wear: {
    verb: 'wear',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (!o.wearable) return w.say(w.msg('cantWear'));
      if (w.is(dobj, 'worn')) return w.say(w.msg('alreadyWearing'));
      if (!implicitTake(w, dobj)) return;
      w.set(dobj, 'worn');
      w.say(w.text(o.wornMsg) ?? w.msg('wear', { thing: w.the(dobj) }));
    },
  },

  takeOff: {
    verb: 'take off',
    run(w, { dobj }) {
      if (!w.is(dobj, 'worn')) return w.say(w.msg('notWearing'));
      w.set(dobj, 'worn', false);
      w.say(w.msg('takeOff', { thing: w.the(dobj) }));
    },
  },

  talk: {
    verb: 'talk to',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (dobj === PLAYER) return w.say(w.msg('talkSelf'));
      if (o.conversation) return; // step.js opens the conversation
      if (!o.animate) return w.say(w.msg('cantTalk'));
      w.say(w.text(o.talk) ?? w.msg('noConversation', { thing: w.the(dobj) }));
    },
  },

  // Talking with no one named: to whoever is here to talk to (SAY HELLO, ASK ABOUT ...).
  talkAround: {
    verb: 'say',
    run(w) {
      if (!w.isLit()) return w.say(w.msg('talkDark'));
      const people = w.children(w.room).filter((id) => w.obj(id).animate && id !== PLAYER && !w.is(id, 'hidden'));
      const talker = people.find((id) => w.obj(id).conversation) ?? people[0];
      if (!talker) return w.say(w.msg('nobodyHere'));
      if (w.obj(talker).conversation) return { start: talker };
      w.say(w.text(w.obj(talker).talk) ?? w.msg('noConversation', { thing: w.the(talker) }));
    },
  },

  // LEAVE / BYE outside a conversation.
  notTalking: { verb: 'leave', meta: true, run: (w) => w.say(w.msg('notTalking')) },

  throw: { verb: 'throw', run: (w, { dobj }) => w.say(w.msg('throwAway', { thing: w.the(dobj) })) },

  climb: {
    verb: 'climb',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (o.leadsTo || o.passageKind === 'stairs') return travel(w, { door: dobj });
      if (!o.climb) return w.say(w.msg('cantClimb'));
      travel(w, o.climb);
    },
  },

  // GO UP / GO DOWN the stairs: like CLIMB, but only in that direction.
  ascend: {
    verb: 'go up',
    run(w, cmd) {
      if (wayFromHere(w, cmd.dobj) === 'd') return w.say(w.msg('onlyDown', { thing: w.the(cmd.dobj) }));
      ACTIONS.climb.run(w, cmd);
    },
  },

  descend: {
    verb: 'go down',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (wayFromHere(w, dobj) === 'u') return w.say(w.msg('onlyUp', { thing: w.the(dobj) }));
      if (o.leadsTo || o.passageKind === 'stairs') return travel(w, { door: dobj });
      w.say(w.msg('cantClimb'));
    },
  },

  wait: { verb: 'wait', run: (w) => w.say(w.msg('wait')) },

  switchOn: {
    verb: 'turn on',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (!o.switchable) return w.say(w.msg('cantSwitch'));
      if (w.is(dobj, 'on')) return w.say(w.msg('alreadyOn', { thing: w.the(dobj) }));
      w.set(dobj, 'on');
      w.say(w.text(o.switchOnText) || w.msg('switchedOn', { thing: w.the(dobj) }));
    },
  },

  switchOff: {
    verb: 'turn off',
    run(w, { dobj }) {
      const o = w.obj(dobj);
      if (!o.switchable) return w.say(w.msg('cantSwitch'));
      if (!w.is(dobj, 'on')) return w.say(w.msg('alreadyOff', { thing: w.the(dobj) }));
      w.set(dobj, 'on', false);
      w.say(w.text(o.switchOffText) || w.msg('switchedOff', { thing: w.the(dobj) }));
    },
  },

  // LOOK NORTH: the location's own text for that way, or what's there.
  lookDir: {
    verb: 'look',
    run(w, { dir }) {
      const room = w.obj(w.room);
      const own = room.lookDir?.[dir];
      if (own) return w.say(w.text(own));
      const exit = room.exits?.[dir];
      if (exit?.door && !w.is(exit.door, 'hidden')) return w.say(w.msg('lookExit', { thing: w.the(exit.door) }));
      w.say(w.msg('lookNothing'));
    },
  },

  smell: {
    verb: 'smell',
    run(w, { dobj }) {
      const source = dobj ? w.obj(dobj) : w.obj(w.room);
      w.say(w.text(source.smell) ?? w.msg('smellNothing'));
    },
  },

  listen: {
    verb: 'listen to',
    run(w, { dobj }) {
      const source = dobj ? w.obj(dobj) : w.obj(w.room);
      w.say(w.text(source.listen) ?? w.msg('listenNothing'));
    },
  },

  touch: {
    verb: 'touch',
    run(w, { dobj }) {
      w.say(w.text(w.obj(dobj).touch) ?? w.msg('touchNothing'));
    },
  },

  help: {
    verb: 'help',
    meta: true,
    run(w) {
      w.say(w.msg('help'), 'list');
    },
  },
};
