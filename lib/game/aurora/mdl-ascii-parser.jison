%lex
%%

[ \t\r]+     /* skip whitespace */
\#.*(\r?\n)+ /* skip comment */

"filedependancy"    return '@file'
"newmodel"          return '<model>'
"donemodel"         return '</model>'
"setsupermodel"     return '@super'
"classification"    return '@classify'
"setanimationscale" return '@animScale'
"beginmodelgeom"    return '<geom>'
"endmodelgeom"      return '</geom>'
"node"              return '<node>'
"endnode"           return '</node>'
"parent"            return '@parent'
"position"          return '@position'
"orientation"       return '@orientation'
"wirecolor"         return '@wirecolor'
"danglymesh"        return '@danglymesh'
"period"            return '@period'
"tightness"         return '@tightness'
"displacement"      return '@displacement'
"showdispl"         return '@showdispl'
"displtype"         return '@displtype'
"alpha"             return '@alpha'
"transparencyhint"  return '@transparencyhint'
"tilefade"          return '@tilefade'
"scale"             return '@scale'
"render"            return '@render'
"shadow"            return '@shadow'
"beaming"           return '@beaming'
"inheritcolor"      return '@inheritcolor'
"selfillumcolor"    return '@selfillumcolor'
"rotatetexture"     return '@rotatetexture'
"center"            return '@center'
"gizmo"             return '@gizmo'
"colors"            return '@colors'
"constraints"       return '@constraints'
"dummy"             return '@dummy'
"trimesh"           return '@trimesh'
"patch"             return '@patch'
"ambient"           return '@ambient'
"diffuse"           return '@diffuse'
"specular"          return '@specular'
"shininess"         return '@shininess'
"bitmap"            return '@bitmap'
"verts"             return '@vertices'
"faces"             return '@faces'
"tverts"            return '@texCoords'
"newanim"           return '<anim>'
"doneanim"          return '</anim>'
"length"            return '@length'
"transtime"         return '@transTime'
"animroot"          return '@animRoot'
"positionkey"       return '@positionKey'
"orientationkey"    return '@orientationKey'
"event"             return '@event'
"endlist"           return 'ENDLIST'

[-+]?((\d*\.)?\d+)([eE][-+]?\d+)?/[^.\w] return 'Number'
\S+/\s                                   return 'Identifier'

(\r?\n)+ return 'EOL'
<<EOF>>  return 'EOF'
.        return 'INVALID'

/lex

%start file
%%

file
    : '@file' 'Identifier' 'EOL'
       model
       'EOF'
      {$$ = $model; $$.file = $2; return $$;}
    ;

model
    : '<model>' 'Identifier' 'EOL'
      modelProps
      '</model>' 'Identifier' 'EOL'
      {$$ = $modelProps;}
    ;

modelProps:
      {$$ = {geometries: [], animations: []};}

    | modelProps
      animation
      {$$ = $modelProps; $$.animations.push($animation);}

    | modelProps
      geometry
      {$$ = $modelProps; $$.geometries.push($geometry);}

    | modelProps
      '@super' 'Identifier' 'Identifier' 'EOL'
      {$$ = $modelProps; $$.super = [$3, $4];}

    | modelProps
      '@classify' 'Identifier' 'EOL'
      {$$ = $modelProps; $$.classify = $3;}

    | modelProps
      '@animScale' float 'EOL'
      {$$ = $modelProps; $$.animScale = $float;}
    ;

geometry
    : '<geom>' 'Identifier' 'EOL'
      geomNodes
      '</geom>' 'Identifier' 'EOL'
      {$$ = {name: $2, nodes: $geomNodes};}
    ;

geomNodes:
      {$$ = [];}

    | geomNodes
      geomNode
      {$$ = $geomNodes; $$.push($geomNode);}
    ;

geomNode
    : '<node>' geomNodeType 'Identifier' 'EOL'
      geomNodeProps
      '</node>' 'EOL'
      {$$ = $geomNodeProps; $$.type = $geomNodeType; $$.name = $3;}
    ;

geomNodeType
    : '@danglymesh'
    | '@dummy'
    | '@trimesh'
    | '@patch'
    ;

geomNodeProps:
      {$$ = {};}

    | geomNodeProps
      '@parent' 'Identifier' 'EOL'
      {$$ = $geomNodeProps; $$.parent = $3;}

    | geomNodeProps
      '@position' float3 'EOL'
      {$$ = $geomNodeProps; $$.position = $float3;}

    | geomNodeProps
      '@orientation' float4 'EOL'
      {$$ = $geomNodeProps; $$.orientation = $float4;}

    | geomNodeProps
      '@wirecolor' float3 'EOL'
      {$$ = $geomNodeProps; $$.wirecolor = $float3;}

    | geomNodeProps
      '@ambient' float3 'EOL'
      {$$ = $geomNodeProps; $$.ambient = $float3;}

    | geomNodeProps
      '@diffuse' float3 'EOL'
      {$$ = $geomNodeProps; $$.diffuse = $float3;}

    | geomNodeProps
      '@specular' float3 'EOL'
      {$$ = $geomNodeProps; $$.specular = $float3;}

    | geomNodeProps
      '@shininess' float 'EOL'
      {$$ = $geomNodeProps; $$.shininess = $float;}

    | geomNodeProps
      '@bitmap' 'Identifier' 'EOL'
      {$$ = $geomNodeProps; $$.bitmap = $3;}

    | geomNodeProps
      '@danglymesh' int 'EOL'
      {$$ = $geomNodeProps; $$.danglymesh = $int;}

    | geomNodeProps
      '@period' float 'EOL'
      {$$ = $geomNodeProps; $$.period = $float;}

    | geomNodeProps
      '@tightness' float 'EOL'
      {$$ = $geomNodeProps; $$.tightness = $float;}

    | geomNodeProps
      '@displacement' float 'EOL'
      {$$ = $geomNodeProps; $$.displacement = $float;}

    | geomNodeProps
      '@showdispl' 'Identifier' 'EOL'
      {$$ = $geomNodeProps; $$.showdispl = $2;}

    | geomNodeProps
      '@displtype' int 'EOL'
      {$$ = $geomNodeProps; $$.displtype = $int;}

    | geomNodeProps
      '@alpha' float 'EOL'
      {$$ = $geomNodeProps; $$.alpha = $float;}

    | geomNodeProps
      '@transparencyhint' int 'EOL'
      {$$ = $geomNodeProps; $$.transparencyhint = $int;}

    | geomNodeProps
      '@tilefade' int 'EOL'
      {$$ = $geomNodeProps; $$.tilefade = $int;}

    | geomNodeProps
      '@scale' float 'EOL'
      {$$ = $geomNodeProps; $$.scale = $float;}

    | geomNodeProps
      '@render' int 'EOL'
      {$$ = $geomNodeProps; $$.render = $int;}

    | geomNodeProps
      '@shadow' int 'EOL'
      {$$ = $geomNodeProps; $$.shadow = $int;}

    | geomNodeProps
      '@beaming' int 'EOL'
      {$$ = $geomNodeProps; $$.beaming = $int;}

    | geomNodeProps
      '@inheritcolor' int 'EOL'
      {$$ = $geomNodeProps; $$.inheritcolor = $int;}

    | geomNodeProps
      '@selfillumcolor' float3 'EOL'
      {$$ = $geomNodeProps; $$.selfillumcolor = $float3;}

    | geomNodeProps
      '@rotatetexture' int 'EOL'
      {$$ = $geomNodeProps; $$.rotatetexture = $int;}

    | geomNodeProps
      '@center' float3 'EOL'
      {$$ = $geomNodeProps; $$.center = $float3;}

    | geomNodeProps
      '@gizmo' 'Identifier' 'EOL'
      {$$ = $geomNodeProps; $$.gizmo = $2;}

    | geomNodeProps
      '@vertices' int 'EOL'
      float3s
      {$$ = $geomNodeProps; $$.vertices = {count:$int, list:$float3s};}

    | geomNodeProps
      '@faces' int 'EOL'
      faces
      {$$ = $geomNodeProps; $$.faces = {count:$int, list:$faces};}

    | geomNodeProps
      '@texCoords' int 'EOL'
      float3s
      {$$ = $geomNodeProps; $$.texCoords = {count:$int, list:$float3s};}

    | geomNodeProps
      '@colors' int 'EOL'
      float3s
      {$$ = $geomNodeProps; $$.colors = {count:$int, list:$float3s};}

    | geomNodeProps
      '@constraints' int 'EOL'
      floats
      {$$ = $geomNodeProps; $$.constraints = {count:$int, list:$floats};}
    ;

faces:
      {$$ = [];}

    | faces
      int int int int int int int int 'EOL'
      {$$ = $faces; $$.push([$2,$3,$4,$5,$6,$7,$8,$9]);}

    | faces
      int int int int int int int 'EOL'
      {$$ = $faces; $$.push([$2,$3,$4,$5,$6,$7,$8,0]);}
    ;

animation
    : '<anim>' 'Identifier' 'Identifier' 'EOL'
      animProps
      '</anim>' 'Identifier' 'Identifier' 'EOL'
      {$$ = $animProps; $$.name = [$2, $3];}
    ;

animProps:
      {$$ = {nodes:[], events:[]};}

    | animProps
      animNode
      {$$ = $animProps; $$.nodes.push($animNode);}

    | animProps
      '@event' float 'Identifier' 'EOL'
      {$$ = $animProps; $$.events.push({time:$float,name:$4});}

    | animProps
      '@length' float 'EOL'
      {$$ = $animProps; $$.length = $float;}

    | animProps
      '@transTime' float 'EOL'
      {$$ = $animProps; $$.transTime = $float;}

    | animProps
      '@animRoot' 'Identifier' 'EOL'
      {$$ = $animProps; $$.root = $3;}
    ;

animNodeType
    : '@dummy'
    ;

animNode
    : '<node>' animNodeType 'Identifier' 'EOL'
      animNodeProps
      '</node>' 'EOL'
      {$$ = $animNodeProps; $$.name = [$2, $3];}
    ;

animNodeProps:
      {$$ = {};}

    | animNodeProps
      '@parent' 'Identifier' 'EOL'
      {$$ = $animNodeProps; $$.parent = $3;}

    | animNodeProps
      '@positionKey' 'EOL'
      positionKeys
      'ENDLIST' 'EOL'
      {$$ = $animNodeProps; $$.positionKeys = $positionKeys;}

    | animNodeProps
      '@orientationKey' 'EOL'
      orientationKeys
      'ENDLIST' 'EOL'
      {$$ = $animNodeProps; $$.orientationKeys = $orientationKeys;}
    ;

positionKeys:
      {$$ = [];}

    | positionKeys
      float float3 'EOL'
      {$$ = $positionKeys; $$.push([$float, $float3]);}
    ;

orientationKeys:
      {$$ = [];}

    | orientationKeys
      float float4 'EOL'
      {$$ = $orientationKeys; $$.push([$float, $float4]);}
    ;

int: 'Number'
      {$$ = parseInt($1);}
    ;

float: 'Number'
      {$$ = parseFloat($1);}
    ;

float3: 'Number' 'Number' 'Number'
      {$$ = [parseFloat($1),parseFloat($2),parseFloat($3)];}
    ;

float4: 'Number' 'Number' 'Number' 'Number'
      {$$ = [parseFloat($1),parseFloat($2),parseFloat($3),parseFloat($4)];}
    ;

float3s:
      {$$ = [];}

    | float3s
      float float float 'EOL'
      {$$ = $float3s; $$.push($2); $$.push($3); $$.push($4);}
    ;

floats:
      {$$ = [];}

    | floats
      float 'EOL'
      {$$ = $floats; $$.push($2);}
    ;
