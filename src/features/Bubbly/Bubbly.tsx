import BubbleWrap from "./BubbleWrap"
import BubbleContainer from "./BubbleContainer";

const Bubbly = () => {

    const fakeFunction = (id: string) => {
        id;
    }

    return (
        <main className="bubbly">
            <div className="bubbly-frame">
                <header className="bubbly-header">
                    <div>
                        <p className="bubbly-eyebrow">Top matter</p>
                        <h1 className="bubbly-title">Top matter</h1>
                        <p className="bubbly-subtitle">More top matter</p>
                    </div>
                    <div className="bubbly-status">
                        <span className="bubbly-status-label">Bubble layer</span>
                        <span className="bubbly-status-value">bubble number here as bubbles.length!</span>
                    </div>
                </header>
                <section className="bubbly-workspace">
                    <BubbleWrap 
                        bubbles={[]}
                        activeBubbleId="fake"
                        onBubbleClick={fakeFunction}
                    />
                    <BubbleContainer 
                        activeBubble={[]}
                        data={[]}
                    />
                </section>
            </div>
        </main>
    );
};

export default Bubbly;