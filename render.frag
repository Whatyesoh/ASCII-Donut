vec3 lookFrom = vec3(0,0,-3);
vec3 lookAt = vec3(0,0,0);
extern float ry;
float rz = ry;
float rx = ry;


struct ray {
    vec3 orig;
    vec3 dir;
};

vec3 unitVector (vec3 v) {
    return v / sqrt(v.x*v.x + v.y*v.y + v.z * v.z);
}

float vecLength (vec3 v) {
    return sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

mat4 translate(vec3 t) {
    return mat4(
        vec4(1,0,0,t.x),
        vec4(0,1,0,t.y),
        vec4(0,0,1,t.z),
        vec4(0,0,0,1)
    );
}

mat4 rotX(float theta) {
    return mat4(
        vec4(1,0         ,0          ,0),
        vec4(0,cos(theta),-sin(theta),0),
        vec4(0,sin(theta),cos(theta) ,0),
        vec4(0,0         ,0          ,1)
    );
}

mat4 rotY(float theta) {
    return mat4(
        vec4(cos(theta) ,0         ,-sin(theta),0),
        vec4(0          ,1         ,0         ,0),
        vec4(sin(theta),0         ,cos(theta),0),
        vec4(0          ,0         ,0         ,1)
    );
}

mat4 rotZ(float theta) {
    return mat4(
        vec4(cos(theta),-sin(theta),0          ,0),
        vec4(sin(theta),cos(theta) ,0          ,0),
        vec4(0         ,0          ,1          ,0),
        vec4(0         ,0          ,0          ,1)
    );
}

float torIntersect( in vec3 ro, in vec3 rd, in vec2 tor )
{
    float po = 1.0;
    float Ra2 = tor.x*tor.x;
    float ra2 = tor.y*tor.y;
    float m = dot(ro,ro);
    float n = dot(ro,rd);
    float k = (m + Ra2 - ra2)/2.0;
    float k3 = n;
    float k2 = n*n - Ra2*dot(rd.xy,rd.xy) + k;
    float k1 = n*k - Ra2*dot(rd.xy,ro.xy);
    float k0 = k*k - Ra2*dot(ro.xy,ro.xy);
    
    if( abs(k3*(k3*k3-k2)+k1) < 0.01 )
    {
        po = -1.0;
        float tmp=k1; k1=k3; k3=tmp;
        k0 = 1.0/k0;
        k1 = k1*k0;
        k2 = k2*k0;
        k3 = k3*k0;
    }
    
    float c2 = k2*2.0 - 3.0*k3*k3;
    float c1 = k3*(k3*k3-k2)+k1;
    float c0 = k3*(k3*(c2+2.0*k2)-8.0*k1)+4.0*k0;
    c2 /= 3.0;
    c1 *= 2.0;
    c0 /= 3.0;
    float Q = c2*c2 + c0;
    float R = c2*c2*c2 - 3.0*c2*c0 + c1*c1;
    float h = R*R - Q*Q*Q;
    
    if( h>=0.0 )  
    {
        h = sqrt(h);
        float v = sign(R+h)*pow(abs(R+h),1.0/3.0); // cube root
        float u = sign(R-h)*pow(abs(R-h),1.0/3.0); // cube root
        vec2 s = vec2( (v+u)+4.0*c2, (v-u)*sqrt(3.0));
        float y = sqrt(0.5*(length(s)+s.x));
        float x = 0.5*s.y/y;
        float r = 2.0*c1/(x*x+y*y);
        float t1 =  x - r - k3; t1 = (po<0.0)?2.0/t1:t1;
        float t2 = -x - r - k3; t2 = (po<0.0)?2.0/t2:t2;
        float t = 1e20;
        if( t1>0.0 ) t=t1;
        if( t2>0.0 ) t=min(t,t2);
        return t;
    }
    
    float sQ = sqrt(Q);
    float w = sQ*cos( acos(-R/(sQ*Q)) / 3.0 );
    float d2 = -(w+c2); if( d2<0.0 ) return -1.0;
    float d1 = sqrt(d2);
    float h1 = sqrt(w - 2.0*c2 + c1/d1);
    float h2 = sqrt(w - 2.0*c2 - c1/d1);
    float t1 = -d1 - h1 - k3; t1 = (po<0.0)?2.0/t1:t1;
    float t2 = -d1 + h1 - k3; t2 = (po<0.0)?2.0/t2:t2;
    float t3 =  d1 - h2 - k3; t3 = (po<0.0)?2.0/t3:t3;
    float t4 =  d1 + h2 - k3; t4 = (po<0.0)?2.0/t4:t4;
    float t = 1e20;
    if( t1>0.0 ) t=t1;
    if( t2>0.0 ) t=min(t,t2);
    if( t3>0.0 ) t=min(t,t3);
    if( t4>0.0 ) t=min(t,t4);
    return t;
}

vec3 nTorus( in vec3 pos, vec2 tor )
{
	return normalize( pos*(dot(pos,pos)- tor.y*tor.y - tor.x*tor.x*vec3(1.0,1.0,-1.0)));
}


vec4 effect(vec4 color, Image texture, vec2 uv, vec2 xy) {

    vec3 light = vec3(3,3,-3);

    mat4 rotateY = mat4(vec4(cos(ry),0,-sin(ry),0),vec4(0,1,0,0),vec4(sin(ry),0,cos(ry),0),vec4(0,0,0,1));

    lookFrom = (rotateY * vec4(lookFrom,1)).xyz;

    float width = xy.x / uv.x;
    float height = xy.y / uv.y;
    float vPHeight = 2 / 1;
    float vPWidth = vPHeight * (width/height);
    number samplesPerPixel = 1;
    vec3 cameraCenter = lookFrom;
    float focalLength = 1;
    vec3 vup = unitVector(vec3(0,1,0));
    vec3 w = unitVector(lookFrom-lookAt);
    vec3 u = unitVector(cross(vup,w));
    vec3 v = cross(w,u);
    vec3 vPU = vPWidth * u;
    vec3 vPV = vPHeight * -v;
    vec3 pDU = vPU / width;
    vec3 pDV = vPV / height;
    vec3 vUL = cameraCenter - (focalLength * w) - vPU/2 - vPV/2;
    vec3 pixelOrigin = vUL + .5 * pDV + .5 * pDU;

    ray r;
    r.orig = cameraCenter;
    r.dir = pixelOrigin + xy.x * pDU + xy.y * pDV - r.orig;
    vec3 point = r.orig;
    r.dir = unitVector(r.dir);

    vec3 hitSpot = vec3(-.5,-.5,2);

    vec3 hitLoc;
    vec3 normal;

    float t = torIntersect(r.orig,r.dir,vec2(1,.5));

    if (t > 0) {

        vec3 normal = nTorus(r.orig + t * r.dir,vec2(1,.5));

        light = (rotateY * vec4(light,1)).xyz;

        light = normalize(light-(r.orig + t * r.dir));

        float brightness = dot(light,normal);

        return vec4(brightness,brightness,brightness,1);
    }
    return vec4(.5,.7,1,1);
}