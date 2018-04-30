import * as React from 'react'
import * as classNames from 'classnames'


// UI-Tester. Inspired by [react-storyboard](https://github.com/storybooks/react-storybook) - but not so bloated


const sections: Section[] = []


interface Test {
    title: string
    renderTest: (context: any) => void
    path: string
    state: any
}


interface Section {
    title: string
    tests: Test[]
    arenaStyle?: any
    renderDecorator?: (testView: React.ReactInstance) => React.ReactInstance
}


export function addSection(sectionTitle: string) {
    const tests: Test[] = [],
        section: Section = { title: sectionTitle, tests }

    sections.push(section)

    const sectionBuilder = {
        setArenaStyle(style) {
            section.arenaStyle = style
            return sectionBuilder
        },

        setDecorator(renderDecorator) {
            section.renderDecorator = renderDecorator
            return sectionBuilder
        },

        add(title, renderTest) {
            tests.push({
                title,
                renderTest,
                path: '/' + encodePathItem(sectionTitle) + '/' + encodePathItem(title),
                state: {}
            })
            return sectionBuilder
        }
    }

    return sectionBuilder
}


function encodePathItem(pathItem) {
    return encodeURIComponent(pathItem.replace(/[ /_]+/g, '_'))
}


export function action(name) {
    return (...args) => {
        console.log('Action ' + name + ':', ...args)
    }
}


interface Props {
}

interface State {
    currentSection: Section
    currentTest: Test
}

export default class UiTester extends React.Component<Props, State> {

    constructor(props) {
        super(props)

        let currentSection = null,
            currentTest = null,
            path = location.hash.substring(1) // Remove leading `#`

        for (let section of sections) {
            for (let test of section.tests) {
                if (test.path == path) {
                    currentSection = section
                    currentTest = test
                    break
                }
            }

            if (currentTest) {
                break
            }
        }

        this.state = {
            currentSection,
            currentTest
        }
    }

    _showTest(section, test) {
        this.setState({ currentSection: section, currentTest: test })
        location.hash = test.path
    }

    render() {
        const state = this.state

        let testView = null
        let arenaStyle = null
        if (state.currentTest) {
            testView = state.currentTest.renderTest({
                forceUpdate: this.forceUpdate.bind(this),
                state: state.currentTest.state
            })
            arenaStyle = state.currentSection.arenaStyle
            if (state.currentSection.renderDecorator) {
                testView = state.currentSection.renderDecorator(testView)
            }
        }

        return (
            <div className="UITester">
                <div className="UITester-sidebar">
                    {sections.map((section, sectionIndex) =>
                        <div className="form-group" key={sectionIndex}>
                            <label>{section.title}</label>
                            <div className="btn-group-vertical btn-block" role="group">
                                {section.tests.map((test, testIndex) =>
                                    <button key={testIndex}
                                            className={classNames('btn btn-default', { active: test == state.currentTest })}
                                            onClick={() => this._showTest(section, test)}
                                    >
                                        {test.title}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="UITester-arena" style={arenaStyle}>
                    {testView}
                </div>
            </div>
        )
    }

}
