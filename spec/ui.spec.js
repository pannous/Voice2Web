// file:///home/peterk/Dokumente/quell/pannous/voice4web/spec/SpecRunner.html?

describe("ui", function() {
    it("clear messages", function() {
        expect(getHandler('clear message')).toEqual({
            "handler":"clear message"
        });     
    
        expect(getHandler('xyz no handler')).toEqual({
            "handler":"default", 
            "parameters" : 'xyz no handler'
        }); 
    });
});