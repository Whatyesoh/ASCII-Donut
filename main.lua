if arg[2] == "debug" then
    require("lldebugger").start()
  end
  
io.stdout:setvbuf("no")

function love.load()
    theta = 0

    --Screen setup

    love.window.setFullscreen(true)
    
    love.window.setVSync(0)

    width = love.graphics.getWidth()
    height = love.graphics.getHeight()

    --Shader/ canvas setup

    mainShader = love.graphics.newShader("render.frag")
    dither = love.graphics.newShader("dither.frag")

    tileset = love.graphics.newImage("Tileset.png")

    if (dither:hasUniform("tileset")) then
        dither:send("tileset",tileset)
    end

    screen = love.graphics.newCanvas()
    render = love.graphics.newCanvas(width,height)

end

function love.update(dt)
    theta = theta + dt
    if (mainShader:hasUniform("ry")) then
        mainShader:send("ry",theta)
    end

end

function love.draw()
    love.graphics.setShader(mainShader)
    love.graphics.setCanvas(render)
    love.graphics.draw(screen)

    love.graphics.setCanvas()
    love.graphics.setShader(dither)
    love.graphics.draw(render)
end