// reversible MX hotswap socket footprint with pre-routed vias

module.exports = {
  params: {
    designator: 'S',
    keycaps: false,
    to: undefined,
    from: undefined,
    via_to_y_offset: -8,
    via_from_y_offset: 5,
    to_pad_x: 6.5,
    to_pad_y: -5,
    from_pad_x: 7,
    from_pad_y: -2.5,
  },
  body: p => {
    const standard = `
      ${p.at /* parametric position */}

      ${'' /* footprint reference */}
      (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
      (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))

      ${''/* corner marks */}
      (fp_line (start -7 -6) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -6 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -6 -7) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -7 6) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 6) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 6 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 6 7) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 7 -6) (layer Dwgs.User) (width 0.15))

      ${''/* middle shaft */}
      (pad "" np_thru_hole circle (at 0 0) (size 3.9878 3.9878) (drill 3.9878) (layers *.Cu *.Mask))

      ${''/* stabilizers */}
      (pad "" np_thru_hole circle (at 5.08 0) (size 1.7018 1.7018) (drill 1.7018) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -5.08 0) (size 1.7018 1.7018) (drill 1.7018) (layers *.Cu *.Mask))
    `;

    const keycap = `
      ${'' /* keycap marks */}
      (fp_line (start -9.5 -9.5) (end 9.5 -9.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start 9.5 -9.5) (end 9.5 9.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start 9.5 9.5) (end -9.5 9.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start -9.5 9.5) (end -9.5 -9.5) (layer Dwgs.User) (width 0.15))
    `;

    const pins = (def_neg, def_pos, def_side) => `
      ${'' /* holes */}
      (pad "" np_thru_hole circle (at ${def_pos}2.54 -5.08) (size 3 3) (drill 3) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at ${def_neg}3.81 -2.54) (size 3 3) (drill 3) (layers *.Cu *.Mask))

      ${'' /* net pads */}
      (pad 1 smd rect (at ${def_neg}${p.from_pad_x} ${p.from_pad_y} ${p.r}) (size 2.55 2.5) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask) ${p.from})
      (pad 2 smd rect (at ${def_pos}${p.to_pad_x} ${p.to_pad_y} ${p.r}) (size 2.55 2.5) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask) ${p.to})
    `;

    const vias = `
      ${'' /* vias */}
      (pad 1 thru_hole circle (at 0 ${p.via_from_y_offset}) (size 0.6 0.6) (drill 0.3) (layers *.Cu) (zone_connect 2) ${p.from})
      (pad 1 thru_hole circle (at 0 ${p.via_to_y_offset}) (size 0.6 0.6) (drill 0.3) (layers *.Cu) (zone_connect 2) ${p.to})
    `;

    const get_at_coordinates = () => {
      const pattern = /\(at (-?[\d\.]*) (-?[\d\.]*) (-?[\d\.]*)\)/;
      const matches = p.at.match(pattern);
      if (matches && matches.length == 4) {
        return [parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3])];
      } else {
        return null;
      }
    }

    const adjust_point = (x, y) => {
      const at_l = get_at_coordinates();
      if(at_l == null) {
        throw new Error(
          `Could not get x and y coordinates from p.at: ${p.at}`
        );
      }
      const at_x = at_l[0];
      const at_y = at_l[1];
      const at_angle = at_l[2];
      const adj_x = at_x + x;
      const adj_y = at_y + y;

      const radians = (Math.PI / 180) * at_angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (adj_x - at_x)) + (sin * (adj_y - at_y)) + at_x,
        ny = (cos * (adj_y - at_y)) - (sin * (adj_x - at_x)) + at_y;

      const point_str = `${nx.toFixed(2)} ${ny.toFixed(2)}`;
      return point_str;
    }

    const traces = `
      ${'' /* traces */}
      (segment (start ${adjust_point(-p.from_pad_x, p.from_pad_y)}) (end ${adjust_point(-p.from_pad_x, p.via_from_y_offset)}) (width 0.25) (layer B.Cu))
      (segment (start ${adjust_point(-p.from_pad_x, p.via_from_y_offset)}) (end ${adjust_point(0, p.via_from_y_offset)}) (width 0.25) (layer B.Cu))
      (segment (start ${adjust_point(p.from_pad_x, p.from_pad_y)}) (end ${adjust_point(p.from_pad_x, p.via_from_y_offset)}) (width 0.25) (layer F.Cu))
      (segment (start ${adjust_point(p.from_pad_x, p.via_from_y_offset)}) (end ${adjust_point(0, p.via_from_y_offset)}) (width 0.25) (layer F.Cu))

      (segment (start ${adjust_point(p.to_pad_x, p.to_pad_y)}) (end ${adjust_point(p.to_pad_x, p.via_to_y_offset)}) (width 0.25) (layer B.Cu))
      (segment (start ${adjust_point(p.to_pad_x, p.via_to_y_offset)}) (end ${adjust_point(0, p.via_to_y_offset)}) (width 0.25) (layer B.Cu))
      (segment (start ${adjust_point(-p.to_pad_x, p.to_pad_y)}) (end ${adjust_point(-p.to_pad_x, p.via_to_y_offset)}) (width 0.25) (layer F.Cu))
      (segment (start ${adjust_point(-p.to_pad_x, p.via_to_y_offset)}) (end ${adjust_point(0, p.via_to_y_offset)}) (width 0.25) (layer F.Cu))
    `;

    return `
      (module MX_direct_reversible_hotswap (layer F.Cu) (tedit 68A39501)
        ${standard}
        ${p.keycaps ? keycap : ''}
        ${vias}
        ${pins('-', '', 'B')}
        ${pins('', '-', 'F')}
      )
      ${traces}
    `;
  }
}
