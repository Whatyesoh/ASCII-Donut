extern Image tileset;

vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {
    int size = 8;

    float width = xy.x / uv.x;
    float height = xy.y / uv.y;

    int minX = int(xy.x/size) * size;
    int minY = int(xy.y/size) * size;

    float brightness = 0;

    float currentX;

    for (int i = minX; i < size + minX; i ++) {
        if (i - xy.x <= .1) {
            currentX = float(i-minX);
        }
        for (int j = minY; j < size + minY; j ++) {
            brightness += Texel(texture,vec2(i/width,j/height)).r;
        }
    }
    
    //return vec4(currentX,currentX,currentX,1);

    brightness /= pow(size,2);

    brightness = brightness * 10;
    brightness = floor(brightness);
    brightness = brightness / 10.0;

    vec4 test = Texel(tileset,vec2(brightness + (.5+currentX)/(size*10.0),mod(xy.y,8)/size));

    return test;

    return vec4(brightness,brightness,brightness,1);
}