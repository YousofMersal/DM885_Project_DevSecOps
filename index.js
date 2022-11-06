function please(){
    return "Hello, World!"
}

module.exports = {
    please: function pleaseInner(){
        return please()
    }
}
